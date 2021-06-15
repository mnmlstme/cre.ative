module.exports = {
    collate
}

function collate ( pkg, front, doc, lang ) {
    const { platform } = front
    const krammer = require(`./platforms/${platform}.js`)
    const code = doc.filter( t => t.type === "code" && t.lang === lang )

    return krammer.collate(pkg, front, code, lang)
}
