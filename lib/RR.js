var Rx = global.Rx;

if (!Rx && require) {
  // just need the core
  Rx = require('rx/dist/rx');
  // simple React-Native support
  require('rx/dist/rx.binding');
}

var RR = {
  _observablePool: {},
  _push: function(arr, element) {
    return arr.push(element);
  },
  _replicate: function(source, subject) {
    return source.subscribe(
      function replicationOnNext(x) {
        setTimeout(function() { subject.onNext(x); }, 0);
      },
      function replicationOnError(err) {
        console.error(err.stack);
      }
    );
  },
  replicate: function(source, name) {
    var sub = name ? RR._getObservable(name) : new Rx.Subject()
    var ret = Object.create(sub);

    Object.defineProperties(ret, {
      subject: { value: sub },
      disposable: { value: RR._replicate(source, sub) }
    });

    return ret;
  },
  _replicatedSubject: function(source) {
    return RR.replicate(source);
  },
  _getObservable: function(dependence) {
    return RR._observablePool[dependence] = RR._observablePool[dependence] || new Rx.Subject();
  },
  _propertyOf: function(context) {
    return function(prop) { return context[prop]; };
  },
  _assignObj: function(obj) {
    return function(propVal, prop) { obj[prop] = propVal; };
  },
  _forOwn: function(subject, handler) {
    Object.keys(subject).map(function(prop, idx) {
      if (subject.hasOwnProperty(prop)) {
        handler(subject[prop], prop);
      }
    })
  },
  _extend: function(subject, extend) {
    RR._forOwn(extend || {}, RR._assignObj(subject));
    return subject;
  },
  observe: function(names) {
    return {
      componentDidMount: function() {
        names.forEach(function(name) {
          RR._replicate(this[name](), RR._getObservable(name));
        }.bind(this));
      }
    };
  },
  subscribe: function(store, opts) {
    var disposables = [];
    function subscribeStore(handlerName, prop) {
      disposables.push(store[prop].subject.subscribe(this[handlerName]));
    }
    return {
      componentWillMount: function() {
        RR._forOwn(opts, subscribeStore.bind(this));
      },
      componentWillUnmount: function() {
        disposables.forEach(function(disposable) { disposable.dispose(); });
      }
    };
  },
  Observable: {
    _assignReplicatedSubject: function(context) {
      return function(observable, prop) {
        return context[prop] = RR._replicatedSubject(observable);
      };
    },
    createAction: function() {
      var dependencies = [], register, extend;
      var action = {};

      var args = [].slice.call(arguments);

      if (argumentsAre(args, ['object'])) {
        var config = args[0];
        action = Object.keys(config).reduce(function(ext, key) {
          defineMemorizedGetter(ext, key, function() {
            var deps = getArgumentsNames(config[key]).map(RR._getObservable);
            return RR._replicatedSubject(config[key].apply(ext, deps));
          });
          return ext;
        }, action);

      } else  {

        if (argumentsAre(args, ['array', 'function'])) {
          dependencies = args[0];
          register = args[1];
        } else if (argumentsAre(args, ['function'])) {
          register = args[0];
          dependencies = getArgumentsNames(register);
        }

        extend = register.apply(action, dependencies.map(RR._getObservable));
        RR._forOwn(extend, RR.Observable._assignReplicatedSubject(action));
      }

      return action;
    },
    createStore: function() {
      var args = [].slice.call(arguments);
      var register = typeof args[args.length - 1] === 'function' ? args.pop() : null;
      if (!register) { throw 'could not create store without register function.'; }

      var registerArgs = args.reduce(function(sofar, curr, idx) {
        if (idx % 2 == 0 && args[idx + 1]) {
          return sofar.concat(args[idx + 1].map(function(dependence) {
            return curr[dependence].subject;
          }));
        }
        return sofar;
      }, []);

      var store = {};
      RR._forOwn(register.apply(store, registerArgs), RR.Observable._assignReplicatedSubject(store));
      return store;
    },
    bind: function(observableName, transform) {
      var subject = new Rx.Subject(), trans = transform || function(x) { return x; }, context = null, disposable = null;

      return function(evt) {
        if (context !== this) {
          if (disposable) {
            disposable.dispose();
            subject = new Rx.Subject();
          }
          disposable = RR._replicate(trans.apply(this, [subject, this]), RR._getObservable(observableName));
          context = this;
        }

        return subject.onNext(evt);
      };
    }
  }
};

function getArgumentsNames(fn) {
  return fn.toString()
    .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg,'')
    .match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1]
    .split(/,/)
}

function argumentsAre(args, types) {
  return types.map(function(type, idx) {
    if (type == 'object') {
      return !!args[idx] && !('length' in args[idx]) && typeof args[idx] == 'object';
    } else if (type == 'array') {
      return !!args[idx] && 'length' in args[idx];
    } else if (type == 'function') {
      return !!args[idx] && typeof args[idx] == 'function';
    } else {
      return !!args[idx];
    }
  }).reduce(function(sofar, curr) {
    return sofar && curr;
  }, true);
}

function defineMemorizedGetter(obj, name, getter) {
  var val;
  Object.defineProperty(obj, name, {
    get: function() {
      if (!val) {
        val = getter.call(obj);
      }
      return val;
    }
  });
}

module.exports = RR;
