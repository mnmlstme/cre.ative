---
title: React Workbook
platform: react-redux
imports:
  - from: react-tiny-fab
    expose:
      - Fab
      - Action
model:
  count: 0
  tenth: 0.1
  myName: React
---

# Hello, React

```jsx
<h1
  style={{
    fontFamily: "Impact",
    textAlign: "center",
    color: "orange",
    width: "100%",
    fontSize: 96,
  }}
>
  Hello, {myName}
</h1>
```

React is a Javascript library for dynamically rendering pages
on the client, i.e., the browser.

JSX is an extension to Javascript which lets us build pages
using a syntax similar to HTML. To make the HTML dynamic,
we can insert Javascript inside of curly braces.

In this example, you can see the familiar `<h1>` tag, with
the standard `style` attribute as we have in HTML.
However, since this is JSX, the inline style is coded as
a Javascript object, and the name is being stored in a
string variable `myName`.

---

```jsx
<h1 className={css.hi}>Hello, {myName}</h1>
```

# Using CSS

We typically don't want to inline styles, even if we can store them
as JS objects. We want to write our styles as classes in CSS, and then
reference them in JSX.

Here's a CSS class that encapsulates the style of the previous
example:

```css
.hi {
  font-family: Impact;
  text-align: center;
  width: 100%;
  color: orange;
  font-size: 96px;
}
```

To reference this class from our JSX, we use the `className` attribute.
(This is the same as the HTML `class` attribute.)
So, adding `className="hi"` to the `h1` element will apply our CSS class.

---

# Components

```jsx
<Hello name={myName} />
```

React also lets you define new elements that can be used in JSX
instead of the standard HTML and SVG tags. These new elements are
called _components_.

Basically, if a tag name begins with a capital
letter, React will look for a Javascript function with that
name and call it. The function must return a JSX expression,
which it then renders.

```jsx
function Hello({ name }) {
  return <h1 className={css.hi}>Hello, {name}</h1>;
}
```

---

# SVG in React

```jsx
<svg viewBox="0 0 100 100">
  <circle className={css.c1} r={50} cx={50} cy={50} />
</svg>
```

React handles SVG elements just like HTML does. This example looks
like SVG code, but it's been coded in JSX. (Notice the curly braces.)
Later we will make this more interesting by computing `r`, `cx`, and
`cy` using Javascript. This is the main reason for using React/JSX instead of
plain HTML and SVG.

Of course, we can also apply CSS to SVG.

```css
.c1 {
  fill: red;
  stroke: black;
}
```
