/// <reference types="rx-lite" />
/// <reference types="rx-core" />
/// <reference types="rx-core-binding" />
/// <reference types="rx-lite-aggregates" />
/// <reference types="rx-lite-backpressure" />
/// <reference types="rx-lite-coincidence" />
/// <reference types="rx-lite-experimental" />
/// <reference types="rx-lite-joinpatterns" />
/// <reference types="rx-lite-time" />
import * as Rx from 'rx';
declare type ExtractObservableGenericType<T> = T extends Rx.IObservable<infer P> ? P : any;
declare type ObservableTransFunc<T> = (...args: Rx.Observable<any>[]) => Rx.IObservable<T>;
declare type Action<T> = {
    [key in keyof T]: Rx.Observable<ExtractObservableGenericType<T[key]>>;
};
declare type ActionConfig<T> = {
    [key in keyof T]: ObservableTransFunc<ExtractObservableGenericType<T[key]>>;
};
interface IObservableStatic {
    createAction<T>(config: ActionConfig<T>): Action<T>;
    createAction<T>(names: string[], func: (...args: Rx.Observable<any>[]) => Action<T>): Action<T>;
    bind(observableName: string, transform?: any): (obj: any) => void;
}
declare const RR: {
    replicate(source: Rx.IObservable<any>, name?: string): any;
    getObservable<T>(name: string): Rx.ISubject<T>;
    Observable: IObservableStatic;
};
export = RR;
