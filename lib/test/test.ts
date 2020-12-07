import * as Rx from 'rx';
import RR, { ObservableTransFunc } from '../RR';

interface Pos {
  x: number;
  y: number;
}

interface ILessonAction {
  a$(): ObservableTransFunc<Pos>
}

const action = RR.Observable.createAction<ILessonAction>({
  a$() {
    return null;
  }
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