module.exports = {
  extract
}

function extract( { scenes }, language ) {
  return scenes.map(tokens =>
      tokens.filter(token =>
        token.type === 'code'
        && (!language || token.lang === language ))
    )
}
