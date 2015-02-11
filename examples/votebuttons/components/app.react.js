var React = require('react');
var Rx = require('rx');
var RR = require('reactive-react');

var Creater = require('./creater.react');
var VoteButtons = require('./vote-buttons.react');

var Votes = require('../stores/votes.store');

function valuesOf(obj) {
  return Object.keys(obj).map(function(prop) {
    return obj[prop]
  });
}

var App = React.createClass({

  mixins: [
    RR.subscribe(Votes, {
      data$: 'handleChange'
    })
  ],

  handleChange: function(data) {
    this.setState({ data: valuesOf(data) });
  },

  getInitialState: function() {
    return { data: [] };
  },

  render: function() {

    var voteButtonList = this.state.data.map(function(vote) {
      return <VoteButtons id={vote.id} val={vote.val} />;
    });

    return (
      <div>
        <Creater />
        {voteButtonList}
      </div>
    );
  }
});

module.exports = App;
