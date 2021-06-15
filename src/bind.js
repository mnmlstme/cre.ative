module.exports = {
    bind
}

function bind ( moduleName, platform ) {
    const krammer = require(`./platforms/${platform}.js`)
    return krammer.bind( moduleName )
}
