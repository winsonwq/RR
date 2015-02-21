var RR = require('reactive-react');

var PlusMinusAction = RR.Observable.createAction(
  ['plus$', 'minus$', 'create$', 'remove$', 'create2$'],
  function(plus$, minus$, create$, remove$, create2$) {

    create2$.subscribe(function(val) {
      console.log(val);
    });

    return {
      plusMinus$: plus$.merge(minus$),
      create$: create$,
      remove$: remove$
    };
  });

module.exports = PlusMinusAction;
