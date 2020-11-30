import 'reflect-metadata';
import { SelectQueryBuilder } from 'typeorm';

type Unmapped = {
  [name: string]: Function | any;
};

type RemapType<T extends Unmapped> = {
  [K in keyof T & string as RemoveScope<K>]: T[K] extends (query, ...filter: infer P) => ProxyQuery<T> ? (...filter: P) => ProxyQuery<T> : T[K];
};

// type ActionType<T> = (...args: Parameters<T>) => { type: string; payload: ReturnType<T> };
type RemoveScope<S extends string> = S extends `scope${infer Tail}` ? `${Tail}` : S;

export type ProxyQuery<T> = RemapType<T> & SelectQueryBuilder<T>;

export const createProxy = <T>(Model: new () => T, queryBuilder: SelectQueryBuilder<T>) => {
  const modelObj: any = new Model();
  const queryBuilderObj = queryBuilder;
  const proxyObject = new Proxy(queryBuilderObj, {
    get: (target, prop: string, receiver) => {
      const funct = 'scope' + prop;
      if (funct in modelObj) {
        return (...val: any[]) => modelObj[funct](proxyObject, ...val);
      }
      return Reflect.get(target, prop, receiver);
    },
  });

  return (proxyObject as any) as ProxyQuery<T>;
};
