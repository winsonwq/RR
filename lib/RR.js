var Rx = require('rx');
var RR = {
  _observablePool: {},
  _replicate: function(source, subject) {
    return source.subscribe(
      function onOnNext(x) {
        setTimeout(function() { subject.onNext(x); }, 0);
      },
      function onError(err) {
        subject.onError(err);
      },
      function onComplete() {
        subject.onCompleted();
      }
    );
  },
  replicate: function(source, name) {
    var sub = name ? RR._getObservable(name) : new Rx.Subject();
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
  _extend: function(ob, extend) {
    forOwn(extend || {}, RR._assignObj(ob));
    return ob;
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
        forOwn(extend, RR.Observable._assignReplicatedSubject(action));
      }

      return action;
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
    .split(/,/);
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

function forOwn(obj, handler) {
  Object.keys(obj).map(function(prop) {
    if (obj.hasOwnProperty(prop)) {
      handler(obj[prop], prop);
    }
  });
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
