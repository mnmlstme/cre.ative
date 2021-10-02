module.exports = {
  extract,
  definitions
}

function extract( { scenes }, language ) {
  return scenes
    .map( scn => scn.view )
    .map( token => token
      && token.type === 'code'
      && (!language || token.lang === language ) ? token : null)
}

function definitions( { scenes }, language ) {
  return scenes
    .map( scn => scn.definitions )
    .reduce( (a,b) => a.concat(b), [] )
    .filter( token => token && (!language || token.lang === language ))
}
