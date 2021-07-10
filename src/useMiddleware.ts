import { useState, useEffect } from 'react';

export type IMiddleware<T = any> = (opts?: T) => boolean | Promise<boolean>;

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
    if (idx >= len || !final)
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
  opts?: T
) {
  const [passed, setPassed] = useState(false);
  useEffect(() => {
    const { promise, cancel } = done(middleware, opts);
    promise.then(({ success, canceled }) => {
      if (!canceled && success) {
        setPassed(true);
      }
    });
    return () => cancel();
  }, [middleware]);
  return passed;
}
