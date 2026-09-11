const React = require("react");
const { Text } = require("react-native");

function MockIcon(props) {
  const { name, color, size, testID, style, ...rest } = props;
  return React.createElement(
    Text,
    { testID, style, color, size, name, ...rest },
    name,
  );
}

MockIcon.glyphMap = {};

module.exports = {
  Ionicons: MockIcon,
};
