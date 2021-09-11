import React, { ComponentType, PropsWithChildren } from 'react';
import { Router } from './Router';
import { IMiddleware, useMiddleware } from './useMiddleware';

interface IWithMiddleware<T = any> {
  middleware: IMiddleware[];
  injectProps?: T;
  fallback?: any;
}

export function withMiddleware<T>(
  WrappedComponent: ComponentType,
  { middleware, injectProps, fallback }: IWithMiddleware<T>
) {
  const WithMiddlewareComponent = ({
    children,
    ...props
  }: PropsWithChildren<any>) => {
    return useMiddleware(middleware, {
      history: Router.history,
      ...props,
    }) ? (
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
