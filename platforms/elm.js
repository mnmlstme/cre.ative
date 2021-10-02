const Kr = require('kram')

module.exports = {
  collate,
  bind,
}

function bind(moduleName, lang = 'elm') {
  return `function(module, node, initial){
    let { Elm } = module
    let app = Elm.${moduleName}.init({node})
  }`
}

function collate(workbook, lang = 'elm') {
  // generates Elm module
  const { imports, moduleName, shape, init } = workbook
  const scenes = Kr.extract(workbook, lang)
  const defns = Kr.definitions(workbook, lang)

  const code = `port module ${moduleName} exposing (main)
import Browser
import Html
import Html.Attributes as Attr
import Json.Decode as Json
${imports.map(genImport).join('\n')}

main : Program () Model Msg
main =
  Browser.element
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }

port kram_input : (String -> msg) -> Sub msg

type alias Model =
  ${genModel(shape)}

init : () -> ( Model, Cmd msg )
init json =
  let
    initial =
      ${genInitModel(init)}
  in
  ( initial, Cmd.none )

type Msg
  = Incoming String

update : Msg -> Model -> ( Model, Cmd msg )
update msg model =
  case msg of
    Incoming json ->
      ( Result.withDefault model <| Json.decodeString decoder json, Cmd.none )

decoder : Json.Decoder Model
decoder =
  ${genDecoder(shape)}

subscriptions : Model -> Sub Msg
subscriptions model =
  kram_input Incoming

view : Model -> Html.Html Msg
view model =
  ${genExposeModel(shape)}
  Html.ol []
    [ ${scenes.map(genView).join('\n    , ')}
    ]

${defns.map(genDefn).join('\n')}
`

  return {
    name: `${moduleName}.${lang}`,
    language: lang,
    code,
  }
}

function genImport(spec) {
  return `import ${spec.from} as ${spec.as}`
}

const typemap = {
  string: 'String',
  int: 'Int',
  float: 'Float',
  boolean: 'Boolean',
}

function genModel(shape) {
  const field = (k, sh) => `${k}: ${genModel(sh)}`

  let t = Kr.arrayType(shape)
  if (t) return `(List ${genModel(t)})`

  t = Kr.recordType(shape)
  if (t)
    return `{ ${Object.entries(t)
      .map(([k, sh]) => field(k, sh))
      .join('\n  ,')}
  }`

  return typemap[Kr.scalarType(shape)] || 't'
}

function genInitModel(model) {
  const field = (k, val) => `${k} = ${JSON.stringify(val)}`

  return `{ ${Object.entries(model)
    .map(([k, val]) => field(k, val))
    .join('\n      , ')}
      }`
}

const decodermap = {
  string: 'Json.string',
  int: 'Json.int',
  float: 'Json.float',
  boolean: 'Json.bool',
}

function genDecoder(shape) {
  const field = (k, sh) => `(Json.field "${k}" <| ${genDecoder(sh)})`

  let t = Kr.arrayType(shape)
  if (t) return `Json.list <| ${genDecoder(t)}`

  t = Kr.recordType(shape)
  if (t) {
    const n = Object.keys(t).length
    return `Json.map${n} Model
    ${Object.entries(t)
      .map(([k, sh]) => field(k, sh))
      .join('\n    ')}`
  }

  return decodermap[Kr.scalarType(shape)] || 't'
}

function genExposeModel(shape) {
  const record = Kr.recordType(shape)
  const expose = (k) => `${k} = model.${k}`

  if (record)
    return `let
    ${Object.keys(record).map(expose).join('\n    ')}
  in`

  return ''
}

function genView(token) {
  return token
    ? `Html.li [Attr.id "${token.id}"]
        [ ${token.text.split('\n').join('\n        ')}
        ]
    `
    : 'Html.li [] []'
}

function genDefn(token) {
  return token.text
}
