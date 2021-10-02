module.exports = {
  extract
}

function extract( { scenes }, language ) {
  return scenes
    .map( scn => scn.view )
    .map( token => token
      && token.type === 'code'
      && (!language || token.lang === language ) ? token : null
    )
}
