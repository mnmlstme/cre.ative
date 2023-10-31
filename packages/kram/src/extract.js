module.exports = {
  extract,
}

function extract({ scenes }, lang) {
  const sceneBlocks = scenes
    .map((scn, i) =>
      scn.blocks
        .filter(
          ([type, attrs]) => type === 'fence' && (!lang || attrs.lang === lang)
        )
        .map(([_, attrs, ...rest]) => [i, attrs, rest.join('\n')])
    )
    .flat(1)

  return {
    scenes: sceneBlocks.filter(([_, attrs]) => attrs.mode === 'eval'),
    definitions: sceneBlocks.filter(([_, attrs]) => attrs.mode === 'define'),
  }
}
