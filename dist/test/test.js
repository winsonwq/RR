"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Rx = require("rx");
var RR = require("../RR");
var action = RR.Observable.createAction({
    a$: function () {
        return null;
    },
    b$: function () {
        return null;
    },
});
action.a$.subscribe(function (item) { return item.length; });
var action2 = RR.Observable.createAction(['a$', 'b$'], function (a$, b$) {
    return {
        a$: new Rx.Subject(),
        b$: new Rx.Subject(),
    };
});
action2.b$.subscribe(function (p) { return p.x; });
var bindFunc = RR.Observable.bind('hello$', null);
bindFunc('hello');
var Either = /** @class */ (function () {
    function Either(val) {
        this.val = val;
    }
    return Either;
}());
var submitCourse = RR.Observable.bind('submitCourse$');
function handleFormSubmit(evt) {
    var formData = evt.formData;
    submitCourse(new Either(formData));
}
var action3 = RR.Observable.createAction({
    a$: function (submitCourse$) {
        submitCourse$.map(function (either) { return either.val.name; });
        return null;
    },
    b$: function () {
        return null;
    }
});
action3.b$.subscribe(function (pos) { return console.log(pos.x); });
