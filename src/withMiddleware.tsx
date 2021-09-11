import React, { ComponentType, PropsWithChildren } from 'react';
import { Router } from './Router';
import {
  IMiddleware,
  useMiddleware,
  IMiddlewareContext,
} from './useMiddleware';

interface IWithMiddleware<T = any> {
  middleware: IMiddleware[];
  injectProps?: T;
  context?: IMiddlewareContext;
  fallback?: any;
}

export function withMiddleware<T>(
  WrappedComponent: ComponentType,
  { middleware, injectProps, fallback, context }: IWithMiddleware<T>
) {
  const WithMiddlewareComponent = ({
    children,
    ...props
  }: PropsWithChildren<any>) => {
    return useMiddleware(
      middleware,
      {
        history: Router.history,
        ...props,
      },
      context
    ) ? (
      <WrappedComponent {...injectProps} {...props}>
        {children}
      </WrappedComponent>
    ) : (
      fallback
    );
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
