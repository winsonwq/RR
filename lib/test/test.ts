import * as Rx from 'rx';
import * as RR from '../RR';

interface Pos {
  x: number;
  y: number;
}

interface ILessonAction {
  a$: Rx.IObservable<string>;
  b$: Rx.IObservable<Pos>;
}

const action = RR.Observable.createAction<ILessonAction>({
  a$() {
    return null;
  },
  b$() {
    return null;
  },
});

action.a$.subscribe((item) => item.length);

const action2 = RR.Observable.createAction<ILessonAction>(['a$', 'b$'], function (a$, b$) {
  return {
    a$: new Rx.Subject(),
    b$: new Rx.Subject(),
  };
});

action2.b$.subscribe(p => p.x);

const bindFunc = RR.Observable.bind('hello$', null);
bindFunc({});
