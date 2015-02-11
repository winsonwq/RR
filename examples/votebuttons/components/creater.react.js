var React = require('react');
var Rx = require('rx');
var RR = require('reactive-react');

var Creater = React.createClass({
  mixins: [RR.observe(['create$'])],

  create$: function() {
    var createOne = this.refs.createBtn.getDOMNode();
    return Rx.Observable.fromEvent(createOne, 'click').map({ val: 10 });
  },

  render: function() {
    return (
      <button ref="createBtn">create one vote</button>
    );
  }

});

module.exports = Creater;
