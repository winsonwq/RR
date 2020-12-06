import * as Rx from 'rx';
import * as RR from '../RR';

interface Pos {
  x: number;
  y: number;
}

const action = RR.Observable.createAction({
  a$() {
    return new Rx.Subject();
  },
});

const action2 = RR.Observable.createAction(
  ['a$', 'b$'],
  function (a$, b$) {
    return {
      c$: new Rx.Subject(),
    };
  }
);

const bindFunc = RR.Observable.bind('hello$', null);
bindFunc({});