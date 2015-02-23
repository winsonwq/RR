var RR = require('reactive-react');
var PlusMinusAction = require('../actions/votes.action');

var Votes = RR.Observable.createStore(
    PlusMinusAction, ['plusMinus$', 'create$', 'remove$'],
    PlusMinusAction, ['plusMinus$', 'create$', 'remove$'],
    function(pm$, c$, r$, pm2$) {
      var data = { 1: { id: 1, val: 10 } };

      var create$ = c$.scan(data, function(sofar, curr) {
        var id = Date.now();
        sofar[id] = { id: id, val: curr.val };
        return sofar;
      });

      var remove$ = r$.scan(data, function(sofar, curr) {
        for(var prop in sofar) delete sofar[prop];
        return sofar;
      });

      var pmMerge$ = pm2$.scan(data, function(sofar, curr, idx) {
        sofar[curr.id] = sofar[curr.id] || { id: curr.id, val: 0 };
        sofar[curr.id].val += curr.val;
        return sofar;
      });

      return {
        data$: create$.merge(remove$).merge(pmMerge$).startWith(data)
      };
    });

module.exports = Votes;
