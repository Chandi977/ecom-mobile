const React = require('react');

const createMock = name => props => React.createElement(name, props, props.children);

module.exports = {
  Button: createMock('RneButton'),
  CheckBox: createMock('RneCheckBox'),
  Icon: createMock('RneIcon'),
  Input: createMock('RneInput'),
  ListItem: createMock('RneListItem'),
  Overlay: createMock('RneOverlay'),
  Text: createMock('RneText'),
};
