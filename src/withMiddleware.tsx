import { IMiddleware, useMiddleware } from './useMiddleware';
import React, { ComponentType, PropsWithChildren, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import * as H from 'history';
interface IWithMiddleware<T = any> {
  middleware: IMiddleware[];
  injectProps?: T;
}

export function withMiddleware<T>(
  WrappedComponent: ComponentType,
  { middleware, injectProps }: IWithMiddleware<T>
) {
  const WithMiddlewareComponent = (props: PropsWithChildren<any>) => {
    const history = useHistory();
    const historyRef = useRef<H.History<any>>();

    if (historyRef.current !== history) {
      historyRef.current = history;
    }

    const success = useMiddleware(middleware, historyRef.current);
    return success ? <WrappedComponent {...injectProps} {...props} /> : null;
  };

  WithMiddlewareComponent.displayName = `withMiddleware(${getDisplayName(
    WrappedComponent
  )})`;
  WithMiddlewareComponent.WrapComponent = WrappedComponent;

  return WithMiddlewareComponent;
}

function getDisplayName(WrappedComponent: ComponentType) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
