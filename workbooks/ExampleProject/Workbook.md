---
title: Web Workbook
platform: web-standard
---

# Hello world

```html
<p class="hi">Hello, creative world.</p>
```

Here is some CSS to style it:

```css
.hi {
  font-family: Georgia;
  color: darkorange;
  font-size: 6rem;
}
```

---

```svg
<circle class="c1" r="10" cx="50" cy="50"/>
```

# Hello artboard

Some CSS to style our drawing:

```css
.c1 {
  fill: red;
  stroke: black;
}
```

---

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

# Hello Javascript

Some Javascript to add an action to the button:

```js
function sayHello(event) {
  window.alert("Hello, Javascript!");
}
```
