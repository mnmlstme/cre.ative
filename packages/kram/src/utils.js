module.exports = {
    scalarType: sh => typeof sh === 'string' && sh,
    arrayType: sh => typeof sh === 'object' && sh['array'] || false,
    recordType: sh => typeof sh === 'object' && sh['record'] || false
}
