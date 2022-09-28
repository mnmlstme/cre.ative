module.exports = {
  extract,
}

function extract({ scenes }, mode, lang) {
  return scenes
    .map((scn, i) =>
      scn.blocks
        .filter((b) => {
          const [type, attrs] = b

          return (
            type === 'fence' &&
            (!lang || attrs.lang === lang) &&
            (!mode || attrs.mode === mode)
          )
        })
        .map((b) => {
          const [type, attrs, ...rest] = b
          return [type, { scene: i, ...attrs }, ...rest]
        })
    )
    .reduce((a, b) => a.concat(b), [])
}
