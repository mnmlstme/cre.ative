---
title: React Workbook
platform: react-redux
imports: []
model:
  count: 0
  tenth: 0.1
  hello: Hello, world
---

```jsx
<p className={css.hi}>{hello}</p>
```

# Hello, World

This is React.

Here is a sentence.
And another in the same paragraph.

There is some code over on the right side,
which gets rendered above.

We can write documentation alongside the
code to discuss what we're doing.

## File Format: Kram

All code and documentation for the workbook
is maintained in a single file using `kram`,
a text-based format that supports
multiple languages of code in the same file.

```css
.hi {
  font-family: Impact;
  text-align: center;
  width: 100%;
  color: orange;
  font-size: 96px;
}
```

The `react-redux` platform supports the following languages:

- HTML5
- CSS3
- Javascript (ES6)
- JSX (Javascript/React)
- SVG 1.1

---

```jsx
<input type="number" defaultValue={asString(count)} />
```

## Functions

We can put lots of views in the same file like this. We
can also define helper functions. All helper functions in the
workbook are available to every view.

```jsx
function asString(n) {
  return String(n);
}
```
