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

const bindFunc = RR.Observable.bind<string>('hello$', null);
bindFunc('hello');

class Either<T> {
  val: T
  constructor(val: T) {
    this.val = val;
  }
}

interface CourseSubmitData {
  name: string;
  age: number;
}

const submitCourse = RR.Observable.bind<Either<CourseSubmitData>>('submitCourse$');

function handleFormSubmit(evt) {
  const formData = evt.formData;
  submitCourse(new Either(formData));
}

interface Course {
  name: string;
}

interface IAction3 {
  a$: Rx.IObservable<Course>;
  b$: Rx.IObservable<Pos>;
}

const action3 = RR.Observable.createAction<IAction3>({
  a$(submitCourse$) {
    submitCourse$.map(either => (either as Either<CourseSubmitData>).val.name);
    return null;
  },

  b$() {
    return null;
  }
});

action3.b$.subscribe(pos => console.log(pos.x));


