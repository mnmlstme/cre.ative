---
title:
platform: elm
imports: []
model:
  count: 999
  tenth: 0.1
  name: Elm
---

# Introduction

```elm
Html.div [ class "hi" ]
  [Html.text <| "Hello, " ++ name]

```

We can write Html expressions in Elm and have them rendered.

### subtitle

We can also pull in CSS classes and reference them using the `class` attribute.

```css
.hi {
  font-family: Georgia;
  color: #835cf0;
  font-size: 4rem;
}
```

---

```elm
Html.input
  [ Attr.type_ "number"
  , Attr.value <| asString count
  ]
  []
```

# Functions

We can put lots of examples in the same file like this.

We can also define "helper" functions to make the view more
concise.

```elm
asString: Int -> String
asString n =
  String.fromInt n
```

Alternatively, we can use views to test or demo the functions
that we define in the same file.
