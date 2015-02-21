var React = require('react');
var Rx = require('rx');
var RR = require('reactive-react');

var Remover = React.createClass({
  mixins: [RR.observe(['remove$'])],

  remove$: function() {
    var removeOne = this.refs.removeBtn.getDOMNode();
    return Rx.Observable.fromEvent(removeOne, 'click').map(0);
  },

  render: function() {
    return (
      <button ref="removeBtn">remove first vote</button>
    );
  }

});

module.exports = Remover;
