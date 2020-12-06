/// <reference types="rx-core-binding" />
/// <reference types="rx-lite" />
/// <reference types="rx-core" />
/// <reference types="rx-lite-aggregates" />
/// <reference types="rx-lite-backpressure" />
/// <reference types="rx-lite-coincidence" />
/// <reference types="rx-lite-experimental" />
/// <reference types="rx-lite-joinpatterns" />
/// <reference types="rx-lite-time" />
import * as Rx from 'rx';
interface IAction {
    [key: string]: Rx.IObservable<any>;
}
declare type ObservableTransFunc = (...args: Rx.Observable<any>[]) => Rx.IObservable<any>;
interface IActionConfig {
    [key: string]: ObservableTransFunc;
}
interface IObservableStatic {
    createAction(config: IActionConfig): IAction;
    createAction(names: string[], func: (...args: any[]) => object): IAction;
    bind(observableName: string, transform: any): (obj: any) => void;
}
declare const RR: {
    replicate(source: Rx.IObservable<any>, name?: string): any;
    getObservable<T>(name: string): Rx.ISubject<T>;
    Observable: IObservableStatic;
};
export = RR;
