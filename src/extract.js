module.exports = {
  extract,
};

function extract({ scenes }, mode, lang) {
  return scenes
    .map((scn) =>
      scn.blocks
        .filter( b => {
          const [type, attrs] = b

          return type === 'fence' &&
            (!lang || attrs.lang === lang) &&
            (!mode || attrs.mode === mode)

        })
    )
    .reduce((a, b) => a.concat(b), []);
}
