module.exports = {
  extract,
};

function extract({ scenes }, mode, lang) {
  return scenes
    .map((scn) =>
      scn.blocks
        .filter((b) => !lang || b.lang === lang)
        .filter((b) => !mode || b.mode === mode)
    )
    .reduce((a, b) => a.concat(b), []);
}
