var RR = require('reactive-react');

// var PlusMinusAction = RR.Observable.createAction(
//   // ['plus$', 'minus$', 'create$', 'remove$'],
//   function(plus$, minus$, create$, remove$) {
//
//     return {
//       plusMinus$: plus$.merge(minus$),
//       create$: create$,
//       remove$: remove$
//     };
//
//   });

var PlusMinusAction = RR.Observable.createAction({

  plusMinus$: function(plus$, minus$) {
    return plus$.merge(minus$);
  },

  create$: function(create$) {
    return create$;
  },

  remove$: function(remove$) {
    return remove$;
  }

});

module.exports = PlusMinusAction;
