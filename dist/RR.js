"use strict";
var Rx = require("rx");
var _observablePool = {};
function _replicate(source, subject) {
    return source.subscribe(function onOnNext(x) {
        setTimeout(function () {
            subject.onNext(x);
        }, 0);
    }, function onError(err) {
        subject.onError(err);
    }, function onComplete() {
        subject.onCompleted();
    });
}
function _getObservable(name) {
    return (_observablePool[name] = _observablePool[name] || new Rx.Subject());
}
function _replicatedSubject(source) {
    return RR.replicate(source);
}
function getArgumentsNames(fn) {
    return fn
        .toString()
        .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/gm, '')
        .match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1]
        .split(/,/);
}
function argumentsAre(args, types) {
    return types
        .map(function (type, idx) {
        if (type == 'object') {
            return !!args[idx] && !('length' in args[idx]) && typeof args[idx] == 'object';
        }
        else if (type == 'array') {
            return !!args[idx] && 'length' in args[idx];
        }
        else if (type == 'function') {
            return !!args[idx] && typeof args[idx] == 'function';
        }
        else {
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
        get: function () {
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
var Observable = {
    createAction: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var dependencies = [], register, extend;
        var action = {};
        if (argumentsAre(args, ['object'])) {
            var config_1 = args[0];
            action = Object.keys(config_1).reduce(function (ext, key) {
                defineMemorizedGetter(ext, key, function () {
                    var deps = getArgumentsNames(config_1[key]).map(_getObservable);
                    return _replicatedSubject(config_1[key].apply(ext, deps));
                });
                return ext;
            }, action);
        }
        else {
            if (argumentsAre(args, ['array', 'function'])) {
                dependencies = args[0];
                register = args[1];
            }
            else if (argumentsAre(args, ['function'])) {
                register = args[0];
                dependencies = getArgumentsNames(register);
            }
            extend = register.apply(action, dependencies.map(_getObservable));
            for (var prop in extend) {
                _assignReplicatedSubject(action)(extend[prop], prop);
            }
        }
        return action;
    },
    bind: function (observableName, transform) {
        var subject = new Rx.Subject(), trans = transform || (function (x) { return x; }), context = null, disposable = null;
        return function (evt) {
            if (context !== this) {
                if (disposable) {
                    disposable.dispose();
                    subject = new Rx.Subject();
                }
                disposable = _replicate(trans.apply(this, [subject, this]), _getObservable(observableName));
                context = this;
            }
            return subject.onNext(evt);
        };
    },
};
var RR = {
    replicate: function (source, name) {
        if (name === void 0) { name = null; }
        var sub = name ? _getObservable(name) : new Rx.Subject();
        var ret = Object.create(sub);
        Object.defineProperties(ret, {
            subject: { value: sub },
            disposable: { value: _replicate(source, sub) },
        });
        return ret;
    },
    getObservable: function (name) {
        return _getObservable(name);
    },
    Observable: Observable,
};
module.exports = RR;
