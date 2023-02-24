module.exports = {
  classify,
}

function classify(wb, modules) {
  const { scenes } = wb

  return Object.assign({}, wb, {
    scenes: scenes.map((scene) => classifyScene(scene, modules)),
  })
}

function classifyScene(scene, modules = []) {
  const out = scene.blocks.map((b, i) => {
    //console.log('Classify:', b)
    const [type, attrs, ...rest] = b

    if (type === 'fence') {
      const { lang } = attrs
      const [code] = rest
      const module = modules.find((m) => m.language === lang)
      const classifier = (module && module.classify) || defaultClassifier
      const classified = classifier(code, lang)

      //console.log("Classified:", lang, code, classified)

      return [type, Object.assign(attrs, classified), ...rest]
    } else {
      return b
    }
  })

  return Object.assign({}, scene, { blocks: out })
}
