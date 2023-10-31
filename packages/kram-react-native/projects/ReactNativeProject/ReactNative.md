---
title: React Native Demo
platform: react-native
imports:
  - from: react-native
    expose:
      - Frame
      - StyleSheet
      - Text
      - View
model:
  name: Native
  tagText: Tag Text
---

# Hello, Native

```jsx
<Text
  style={{
    fontSize: "6rem",
    fontFamily: "Impact, serif",
    color: "orange",
    textAlign: "center",
  }}
>
  Hello, {name}
</Text>
```

This workbook demonstrates how we can use React to build a native UI,
while viewing our progress in the browser.

The primitive components we are using come from [React Native](https://reactnative.dev),
and are rendered in the browser with [React Native for Web](https://necolas.github.io/react-native-web/).

---

# A Simple `Tag` Component

```jsx
<View style={tagStyles.root}>
  <Text style={tagStyles.content}>{tagText}</Text>
</View>
```

Here we start to outline a simple component consisting of a `View` and some `Text`.
We start by creating a `StyleSheet` so we don't inline the styles.

```jsx
const tagStyles = StyleSheet.create({
  root: {
    backgroundColor: "#423248",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  content: {
    color: "white",
    fontFamily: 'Verdana, Futura, "Trebuchet MS", sans-serif',
  },
});
```
