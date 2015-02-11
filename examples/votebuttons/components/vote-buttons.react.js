var React = require('react');
var Rx = require('rx');
var RR = require('reactive-react');

var VoteButtons = React.createClass({

  mixins: [RR.observe(['plus$', 'minus$'])],

  getInitialState: function() {
    return { value: 0 };
  },

  minus$: function() {
    var minusOne = this.refs.btnMinusOne.getDOMNode();
    return Rx.Observable.fromEvent(minusOne, 'click').map({ val: -1, id: this.props.id });
  },

  plus$: function() {
    var plusOne = this.refs.btnPlusOne.getDOMNode();
    return Rx.Observable.fromEvent(plusOne, 'click').map({ val: 1, id: this.props.id });
  },

  render: function() {
    return (
      <div>
        <button ref="btnMinusOne" onClick={this.handleMinusOne}>-1</button>
        <span>{this.props.val}</span>
        <button ref="btnPlusOne">+1</button>
      </div>
    );
  }
});

module.exports = VoteButtons;
