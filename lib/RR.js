var Rx = require('rx');

var RR = {
  _observablePool: {},
  _push: function(arr, element) {
    return arr.push(element);
  },
  _replicate: function(source, subject) {
    return source.subscribe(
      function replicationOnNext(x) {
        subject.onNext(x);
      },
      function replicationOnError(err) {
        console.error(err);
      }
    );
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
    return {
      componentWillMount: function() {
        RR._forOwn(opts, this._subscribeStore);
      },
      _subscribeStore: function(handlerName, prop) {
        store[prop].subscribe(this[handlerName]);
      }
    };
  },
  Observable: {
    create: function(dependencies, register, fetchFunc) {
      var observable = {};
      return RR._extend(observable, register.apply(observable, dependencies.map(fetchFunc || RR._propertyOf(RR._observablePool))));
    },
    createAction: function(dependencies, register) {
      return RR.Observable.create(dependencies, register, RR._getObservable);
    },
    createStore: function(action, dependencies, register) {
      return RR.Observable.create(dependencies, register, RR._propertyOf(action));
    },
    bind: function(observableName, transform) {
      var bind = false, subject = new Rx.Subject(), trans = transform || function(x) { return x; };

      return function(evt) {
        if (!bind) {
          RR._replicate(trans.call(this, subject), RR._getObservable(observableName));
          bind = true;
        }
        return subject.onNext(evt);
      };
    }
  }
};

module.exports = RR;
