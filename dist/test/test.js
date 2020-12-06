"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Rx = require("rx");
var RR = require("../RR");
var action = RR.Observable.createAction({
    a$: function (b$) {
        return b$;
    },
});
var action2 = RR.Observable.createAction(['a$', 'b$'], function (a$, b$) {
    return {
        c$: new Rx.Subject(),
    };
});
var bindFunc = RR.Observable.bind('hello$', null);
bindFunc({});
