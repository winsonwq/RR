import * as Rx from 'rx';

interface IObservablePool {
  [key: string]: Rx.ISubject<any>;
}

interface IAction {
  [key: string]: Rx.IObservable<any>;
}

type ObservableTransFunc = <T>(
  ...args
) => Rx.IObservable<T>;

interface IActionConfig {
  [key: string]: ObservableTransFunc;
}

interface IObservableStatic {
  createAction(config: IActionConfig): IAction;
  // TODO: not well
  createAction(
    names: string[],
    func: (...args) => object
  ): IAction;
  bind(
    observableName: string,
    transform: any
  ): (obj) => void;
}

const _observablePool: IObservablePool = {};

function _replicate<T>(
  source: Rx.IObservable<T>,
  subject: Rx.Subject<T>
) {
  return source.subscribe(
    function onOnNext(x) {
      setTimeout(() => {
        subject.onNext(x);
      }, 0);
    },
    function onError(err) {
      subject.onError(err);
    },
    function onComplete() {
      subject.onCompleted();
    }
  );
}

function _getObservable<T>(name) {
  return (_observablePool[name] =
    _observablePool[name] || new Rx.Subject<T>());
}

function _replicatedSubject(source) {
  return RR.replicate(source);
}

function getArgumentsNames(fn: Function): string[] {
  return fn
    .toString()
    .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/gm, '')
    .match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1]
    .split(/,/);
}

function argumentsAre(
  args: any[],
  types: ('object' | 'array' | 'function')[]
) {
  return types
    .map(function (type, idx) {
      if (type == 'object') {
        return (
          !!args[idx] &&
          !('length' in args[idx]) &&
          typeof args[idx] == 'object'
        );
      } else if (type == 'array') {
        return !!args[idx] && 'length' in args[idx];
      } else if (type == 'function') {
        return (
          !!args[idx] && typeof args[idx] == 'function'
        );
      } else {
        return !!args[idx];
      }
    })
    .reduce(function (sofar, curr) {
      return sofar && curr;
    }, true);
}

function defineMemorizedGetter(obj, name, getter) {
  var val;
  Object.defineProperty(obj, name, {
    get() {
      if (!val) {
        val = getter.call(obj);
      }
      return val;
    },
  });
}

function _assignReplicatedSubject(context) {
  return function (observable, prop) {
    return (context[prop] = _replicatedSubject(observable));
  };
}

const Observable: IObservableStatic = {
  createAction(...args): IAction {
    let dependencies = [],
      register,
      extend;
    let action = {};

    if (argumentsAre(args, ['object'])) {
      let config = args[0];
      action = Object.keys(config).reduce(function (
        ext,
        key
      ) {
        defineMemorizedGetter(ext, key, function () {
          var deps = getArgumentsNames(config[key]).map(
            _getObservable
          );
          return _replicatedSubject(
            config[key].apply(ext, deps)
          );
        });
        return ext;
      },
      action);
    } else {
      if (argumentsAre(args, ['array', 'function'])) {
        dependencies = args[0];
        register = args[1];
      } else if (argumentsAre(args, ['function'])) {
        register = args[0];
        dependencies = getArgumentsNames(register);
      }

      extend = register.apply(
        action,
        dependencies.map(_getObservable)
      );

      for (let prop in extend) {
        _assignReplicatedSubject(action)(
          extend[prop],
          prop
        );
      }
    }

    return action;
  },
  bind(observableName: string, transform) {
    var subject = new Rx.Subject(),
      trans = transform || ((x) => x),
      context = null,
      disposable = null;

    return function (evt) {
      if (context !== this) {
        if (disposable) {
          disposable.dispose();
          subject = new Rx.Subject();
        }
        disposable = _replicate(
          trans.apply(this, [subject, this]),
          _getObservable(observableName)
        );
        context = this;
      }

      return subject.onNext(evt);
    };
  },
};

const RR = {
  replicate(
    source: Rx.IObservable<any>,
    name: string = null
  ) {
    var sub = name
      ? _getObservable(name)
      : new Rx.Subject<any>();

    var ret = Object.create(sub);

    Object.defineProperties(ret, {
      subject: { value: sub },
      disposable: { value: _replicate(source, sub) },
    });

    return ret;
  },

  Observable,
};

export default RR;
