/// <reference types="rx-core-binding" />
/// <reference types="rx-lite" />
import * as Rx from 'rx';
interface IAction {
    [key: string]: Rx.IObservable<any>;
}
declare type ObservableTransFunc = <T>(...args: any[]) => Rx.IObservable<T>;
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
