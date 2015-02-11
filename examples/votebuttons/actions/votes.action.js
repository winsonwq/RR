var RR = require('reactive-react');

var PlusMinusAction = RR.Observable.createAction(['plus$', 'minus$', 'create$'], function(plus$, minus$, create$) {
  return {
    plusMinus$: plus$.merge(minus$),
    create$: create$
  };
});

module.exports = PlusMinusAction;
