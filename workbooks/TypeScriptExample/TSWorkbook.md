---
title: Typescript Workbook
platform: typescript
---

# Hello Javascript

```html
<button id="the-button">Hello, click me</button>

<script>
  document
    .getElementById("the-button")
    .addEventListener("click", () =>
      window.alert("Hello, Javascript")
    );
</script>
```

Some Typescript to add an action to the button:

```ts
function sayHello(event: ClickEvent): void {
  window.alert("Hello, Javascript!");
}
```
