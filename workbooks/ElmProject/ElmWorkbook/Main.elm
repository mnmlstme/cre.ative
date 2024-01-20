port module ElmProject.ElmWorkbook.Main exposing (main)
import Browser
import Debug exposing (log)
import Html
import Html.Attributes as Attr exposing (class)
import Json.Decode as Json


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
  { count: Int
  ,tenth: Float
  ,name: String
  }

type alias Model =
  { scope: Scope
  , scene__: Maybe Int
  }

init : Json.Value -> ( Model, Cmd msg )
init json =
  let
    initial =
      { count = 999
      , tenth = 0.1
      , name = "Elm"
      }
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
  Json.map3 Scope
    (Json.field "count" <| Json.int)
    (Json.field "tenth" <| Json.float)
    (Json.field "name" <| Json.string)


subscriptions : Model -> Sub Msg
subscriptions model =
  kram_render Scene

view : Model -> Html.Html Msg
view model =
  let
    count = model.scope.count
    tenth = model.scope.tenth
    name = model.scope.name
  in
  case model.scene__ of
    Just 0 ->
      Html.div [ class "hi" ]
          [Html.text <| "Hello, " ++ name]
        
        
  
    Just 1 ->
      Html.input
          [ Attr.type_ "number"
          , Attr.value <| asString count
          ]
          []
        
  
    _ ->
      Html.text ""

asString: Int -> String
asString n =
  String.fromInt n

