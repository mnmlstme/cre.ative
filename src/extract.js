module.exports = {
  extract
}

function extract( { doc }, language ) {
  return doc.filter(
      token => token.type === 'code' &&
        (!language || token.lang === language )
    )
  }
