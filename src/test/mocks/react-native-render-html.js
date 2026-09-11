const React = require("react");
const { Text } = require("react-native");

function MockRenderHtml({ source }) {
  return React.createElement(Text, { testID: "html-content" }, source.html);
}

module.exports = {
  __esModule: true,
  default: MockRenderHtml,
  defaultSystemFonts: [],
};
