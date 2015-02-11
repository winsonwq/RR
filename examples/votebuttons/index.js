var React = require('react');
var App = require('./components/app.react');
var FastClick = require('fastclick');

React.render(<App />, document.getElementById('app'));
FastClick(document.body);
