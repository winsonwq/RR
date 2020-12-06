"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Rx = require("rx");
var RR_1 = require("../RR");
var action = RR_1.default.Observable.createAction({
    a$: function () {
        return new Rx.Subject();
    },
});
var action2 = RR_1.default.Observable.createAction(['a$', 'b$'], function (a$, b$) {
    return {
        c$: new Rx.Subject(),
    };
});
var bindFunc = RR_1.default.Observable.bind('hello$', null);
bindFunc({});
