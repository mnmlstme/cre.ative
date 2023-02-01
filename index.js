const Kr = require("@cre.ative/kram");

module.exports = {
  name: "elm",
  displayName: "Elm",
  description:
    "The Elm Architecture: a pure functional language with ADTs and an MVU architecture",
  languages: {
    elm: "Elm",
    css: "Cascading Style Sheets",
    svg: "Scalable Vector Graphics",
  },
  register,
};

function register({ providesLanguage }) {
  providesLanguage("elm", {
    use: () => [
      {
        loader: "babel-loader",
        options: {
          plugins: ["module:elm-css-modules-plugin"],
        },
      },
      {
        loader: "elm-webpack-loader",
        options: {
          // add Elm's debug overlay to output
          debug: true,
          optimize: false,
        },
      },
    ],
    bind: (moduleName, lang) =>
      `function(resource, mountpoint, initial){
        let { Elm } = resource
        let safety = mountpoint.appendChild(document.createElement('div'))
        let elmNode = safety.appendChild(document.createElement('div'))
        let app = 
          Elm.${moduleName}.init({ node: elmNode, flags: initial })
        return (n, container) => {
          console.log('Elm rendering scene ', n)
          app.ports.kram_render.send(n-1) /* render the scene */
          let toolbox = safety.lastElementChild
          if ( toolbox && 
            toolbox.style && 
            toolbox.style.position === 'fixed') {
            /* make it absolute instead of fixed */
            console.log('Adjusting position of Elm debug tools')
            toolbox.style.position = 'absolute'
          }
          container.appendChild(safety) /* move it into the scene */
        }
      }`,
    classify: classifyElm,
    collate: (workbook) => {
      const { basename, project } = workbook;
      const moduleName = `${project}.${basename}.Main`;
      const evals = Kr.extract(workbook, "eval", "elm");
      const defns = Kr.extract(workbook, "define", "elm");

      return {
        moduleName,
        name: "Main.elm",
        language: "elm",
        code: generateElm(moduleName, workbook, defns, evals),
      };
    },
  });

  providesLanguage("css", {
    use: () => ({
      loader: "css-loader",
    }),
    collate: (workbook, lang) => {
      const defns = Kr.extract(workbook, "define", lang);

      return {
        name: "styles.css",
        moduleName: "Styles",
        language: "lang",
        code: defns.map((b) => b[2]).join("\n/****/\n\n"),
      };
    },
  });

  providesLanguage("svg", {
    use: () => "svg-inline-loader",
  });
}

const elmDefnRegex = /^\s*(?!let)(\w+)(\s*:|(\s+\w+)*\s*=)/;

function classifyElm(code) {
  const elmDefnMatch = code.match(elmDefnRegex);

  return elmDefnMatch
    ? {
        mode: "define",
        type: "function",
        name: elmDefnMatch[1],
      }
    : { mode: "eval" };
}

function generateElm(moduleName, { init, imports, shape }, defns, evals) {
  // generates Elm module
  console.log("generateElm with imports:", JSON.stringify(imports));
  return `port module ${moduleName} exposing (main)
import Browser
import Debug exposing (log)
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

port kram_render : (Int -> msg) -> Sub msg

type alias Scope = 
  ${genModel(shape)}
  
type alias Model =
  { scope: Scope
  , scene__: Maybe Int
  }

init : Json.Value -> ( Model, Cmd msg )
init json =
  let
    initial =
      ${genInitModel(init)}
    scope = Result.withDefault initial <| Json.decodeValue decoder json
  in
  ({scope = scope, scene__ = Nothing}, Cmd.none )

type Msg
  = Scene Int

update : Msg -> Model -> ( Model, Cmd msg )
update msg model =
  case msg of
    Scene n ->
      ( { model | scene__ = log "render Scene: " <| Just n }, Cmd.none )

decoder : Json.Decoder Scope
decoder =
  ${genDecoder(shape)}


subscriptions : Model -> Sub Msg
subscriptions model =
  kram_render Scene

view : Model -> Html.Html Msg
view model =
  ${genExposeModel(shape)}
  case model.scene__ of
    ${evals.map(genView).join("\n    ")}
    _ -> 
      Html.text ""

${defns.map(genDefn).join("\n")}
`;
}

function genImport(spec) {
  console.log("genImport: ", JSON.stringify(spec));
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
    return `Json.map${n} Scope
    ${Object.entries(t)
      .map(([k, sh]) => field(k, sh))
      .join("\n    ")}`;
  }

  return decodermap[Kr.scalarType(shape)] || "t";
}

function genExposeModel(shape) {
  const record = Kr.recordType(shape);
  const expose = (k) => `${k} = model.scope.${k}`;

  if (record)
    return `let
    ${Object.keys(record).map(expose).join("\n    ")}
  in`;

  return "";
}

function genView(block) {
  const [_, attrs, code] = block;
  const { scene } = attrs;

  return `Just ${scene} ->
      ${code.split("\n").join("\n        ")}
  `;
}

function genDefn(block) {
  return block[2];
}
