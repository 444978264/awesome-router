import { useState, useEffect } from 'react';

export type IMiddleware<T = any> = (opts?: T) => boolean | Promise<boolean>;

export interface IMiddlewareContext {
  state: boolean;
  setState(val: boolean): void;
}

interface IMiddlewareResolve {
  success: boolean;
  canceled: boolean;
}

interface IDone {
  promise: Promise<IMiddlewareResolve>;
  cancel(): void;
}

export function done<T>(middleware: IMiddleware<T>[] = [], opts?: T): IDone {
  let idx = 0;
  let isCancel = false;
  const len = middleware.length;
  function next(final: boolean): Promise<IMiddlewareResolve> {
    if (idx >= len || !final || isCancel)
      return Promise.resolve({
        success: final,
        canceled: isCancel,
      });
    const res = middleware[idx++](opts);
    return res instanceof Promise ? res.then(next) : next(res);
  }
  return {
    promise: next(true),
    cancel() {
      if (!isCancel) {
        isCancel = true;
      }
    },
  };
}

export function useMiddleware<T = any>(
  middleware: IMiddleware<T>[] = [],
  opts?: T,
  context?: IMiddlewareContext
) {
  const [passed, setPassed] = useState(false);
  useEffect(() => {
    if (context?.state) {
      const { promise, cancel } = done<T>(middleware, opts);
      promise.then(({ success, canceled }) => {
        if (!canceled && success) {
          setPassed(true);
          context?.setState(true);
        }
      });

      return () => {
        context?.setState(false);
        cancel();
      };
    }
    return () => {
      context?.setState(false);
    };
  }, [middleware]);
  return passed;
}
