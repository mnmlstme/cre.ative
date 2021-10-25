const marked = require("marked");

module.exports = {
  format,
};

function format(block) {
  console.log("Format: ", block);
  return marked.parser(block.tokens);
}
