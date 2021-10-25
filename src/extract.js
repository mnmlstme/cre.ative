module.exports = {
  extract,
};

function extract({ scenes }, mode) {
  return scenes
    .map((scn) => scn.blocks.filter((b) => !mode || b.mode === mode))
    .reduce((a, b) => a.concat(b), []);
}
