const scenes_html = `<html>
            <body><div data-scene="1"><p class="hi">Hello, creative world.</p>
</div>
<div data-scene="3"><button id="the-button">Hello, click me</button>

<script>
  document
    .getElementById("the-button")
    .addEventListener("click", () =>
      window.alert("Hello, Javascript")
    );
</script>
</div></body>
            </html>`;

export { scenes_html as default };
