const Kr = require("kram");

module.exports = {
  collate,
  bind,
  classify,
};

function bind(moduleName, lang = "elm") {
  switch (lang) {
    case "elm":
      return `function(resource, container, initial){
      let { Elm } = resource
      let dummy = document.createElement('div')
      container.appendChild(dummy)
      let app = Elm.${moduleName}.init({ node: dummy, flags: initial })
    }`;
    case "css":
      return `function(resource, container) {
        let sheet = document.createElement('style')
        sheet.innerHTML = resource.default
        container.appendChild(sheet);
      }`;
    default:
      return null;
  }
}

const elmDefnRegex = /^\s*(\w+)(\s*:|(\s+\w+)*\s*=)/;

function classify(code, lang) {
  console.log('Classify (elm):', lang, code)
  switch (lang) {
    case "elm":
      const elmDefnMatch = code.match(elmDefnRegex);
      if (elmDefnMatch) {
        return {
          mode: "define",
          type: "function",
          name: elmDefnMatch[1],
        };
      } else {
        return { mode: "eval" };
      }
    default:
      return { mode: "define" };
  }
}

function collate(workbook, lang) {
  // generates Elm module
  const evals = Kr.extract(workbook, "eval", lang);
  const defns = Kr.extract(workbook, "define", lang);

  switch (lang) {
    case "elm":
      return {
        name: "Main.elm",
        language: "elm",
        code: generateElm(evals, defns, workbook),
      };
    case "css":
      return {
        name: "styles.css",
        language: "css",
        code: defns.map((b) => b[2]).join("\n/****/\n\n"),
      };
    default:
      return {
        name: `data.${lang}`,
        language: lang,
        code: defns.map((b) => b[2]).join("\n"),
      };
  }
}

function generateElm(evals, defns, { moduleName, init, imports, shape }) {
  // generates Elm module
  return `port module ${moduleName} exposing (main)
import Browser
import Html
import Html.Attributes as Attr exposing (class)
import Json.Decode as Json
${imports.map(genImport).join("\n")}

main : Program Json.Value Model Msg
main =
  Browser.element
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }

port kram_input : (Json.Value -> msg) -> Sub msg

type alias Model =
  ${genModel(shape)}

init : Json.Value -> ( Model, Cmd msg )
init json =
  let
    initial =
      ${genInitModel(init)}
  in
  ( Result.withDefault initial <| Json.decodeValue decoder json , Cmd.none )

type Msg
  = Incoming Json.Value

update : Msg -> Model -> ( Model, Cmd msg )
update msg model =
  case msg of
    Incoming json ->
      ( Result.withDefault model <| Json.decodeValue decoder json, Cmd.none )

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
    [ ${evals.map(genView).join("\n    , ")}
    ]

${defns.map(genDefn).join("\n")}
`;
}

function genImport(spec) {
  return `import ${spec.from} as ${spec.as}`;
}

const typemap = {
  string: "String",
  int: "Int",
  float: "Float",
  boolean: "Boolean",
};

function genModel(shape) {
  const field = (k, sh) => `${k}: ${genModel(sh)}`;

  let t = Kr.arrayType(shape);
  if (t) return `(List ${genModel(t)})`;

  t = Kr.recordType(shape);
  if (t)
    return `{ ${Object.entries(t)
      .map(([k, sh]) => field(k, sh))
      .join("\n  ,")}
  }`;

  return typemap[Kr.scalarType(shape)] || "t";
}

function genInitModel(model) {
  const field = (k, val) => `${k} = ${JSON.stringify(val)}`;

  return `{ ${Object.entries(model)
    .map(([k, val]) => field(k, val))
    .join("\n      , ")}
      }`;
}

const decodermap = {
  string: "Json.string",
  int: "Json.int",
  float: "Json.float",
  boolean: "Json.bool",
};

function genDecoder(shape) {
  const field = (k, sh) => `(Json.field "${k}" <| ${genDecoder(sh)})`;

  let t = Kr.arrayType(shape);
  if (t) return `Json.list <| ${genDecoder(t)}`;

  t = Kr.recordType(shape);
  if (t) {
    const n = Object.keys(t).length;
    return `Json.map${n} Model
    ${Object.entries(t)
      .map(([k, sh]) => field(k, sh))
      .join("\n    ")}`;
  }

  return decodermap[Kr.scalarType(shape)] || "t";
}

function genExposeModel(shape) {
  const record = Kr.recordType(shape);
  const expose = (k) => `${k} = model.${k}`;

  if (record)
    return `let
    ${Object.keys(record).map(expose).join("\n    ")}
  in`;

  return "";
}

function genView(block) {
  if (!block) {
    return 'Html.li [] []'
  }

  const [_, attrs, code] = block

  return (
    `Html.li [Attr.id "${attrs.id}"]
      [ ${code.split("\n").join("\n        ")}
      ]
    `)
}

function genDefn(block) {
  return block[2];
}
