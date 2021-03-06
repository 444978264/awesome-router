import { History } from 'history';
import React, {
  ComponentType,
  PropsWithChildren,
  ReactNode,
  Suspense,
  SuspenseProps,
} from 'react';
import {
  generatePath,
  match,
  matchPath,
  Route,
  RouteChildrenProps,
  RouteProps,
  Switch,
  withRouter,
} from 'react-router-dom';
import { IMiddleware } from './useMiddleware';
import { withMiddleware } from './withMiddleware';

interface IRouterExtra {
  middleware?: ((d: {
    history: History<any>;
    computedMatch: match;
    location: Location;
  }) => ReturnType<IMiddleware>)[];
  routes?: IRouteChild[];
  redirect?: string;
  name: string;
  title?: ReactNode;
  icon?: ReactNode;
  fallback?: SuspenseProps['fallback'];
}

export type IRouteChild = Omit<RouteProps, 'children'> & IRouterExtra;

export type PropsWithRoute = PropsWithChildren<
  RouteChildrenProps & { route: RouteChild }
>;

export class RouteChild {
  public readonly name: IRouteChild['name'];
  public readonly title: IRouteChild['title'];
  public readonly icon: IRouteChild['icon'];
  public state = false;
  public fallback: SuspenseProps['fallback'];
  private _children: RouteChild[] = [];
  private readonly _middleware: IMiddleware[];
  private readonly _props: RouteProps;
  private _isRedirect: boolean;
  private readonly RouteWrapComponent: ComponentType<RouteProps>;
  private _root?: JSX.Element;

  public get isRedirect() {
    return this._isRedirect;
  }

  get isExact() {
    return !this._isRedirect && (this.match ? this.match.isExact : false);
  }

  public get match() {
    return matchPath(location.pathname, {
      ...this._props,
      path: this.path,
    });
  }

  public get routes() {
    return this._children.filter(r => !r.isRedirect);
  }

  public get root() {
    if (!this._root) {
      const {
        RouteWrapComponent,
        _props: { component: Component, render, ...other },
      } = this;

      const C = Component
        ? (props: any) => {
            return (
              <Component {...props} route={this}>
                {this.children}
              </Component>
            );
          }
        : render
        ? (props: any) =>
            render({
              ...props,
              children: this.children,
              route: this,
            })
        : null;

      const RenderView = C
        ? withRouter(C as ComponentType<any>)
        : React.Fragment;

      this._root = (
        <RouteWrapComponent {...other} path={this.path} key={this.name}>
          <RenderView />
        </RouteWrapComponent>
      );
    }

    return this._root;
  }

  public get children() {
    return (
      <Suspense fallback={this.fallback}>
        <Switch>{this._children.map(route => route.root)}</Switch>
      </Suspense>
    );
  }

  public get path(): string {
    const { path } = this._props;
    return (this._parent ? `${this._parent.path}${path}` : path) as string;
  }

  get parent() {
    return this._parent;
  }

  constructor(
    _options: IRouteChild,
    private readonly _parent?: RouteChild,
    _fallback: SuspenseProps['fallback'] = null
  ) {
    const {
      name,
      title,
      icon,
      middleware = [],
      redirect,
      fallback,
      ...props
    } = _options;
    this.name = name;
    this.title = title;
    this.icon = icon;
    this._props = props;
    this._middleware = middleware;
    this._isRedirect = !!redirect;
    this.fallback = fallback ?? this._parent?.fallback ?? _fallback;

    this.RouteWrapComponent = this._middleware.length
      ? withMiddleware(Route, {
          middleware: this._middleware,
          fallback: this.fallback,
          context: this,
        })
      : Route;
  }

  setState(value: boolean) {
    this.state = value;
  }

  public realPath(params?: Record<string, any>) {
    return generatePath(this.path, params);
  }

  public setChildren(children: RouteChild[]) {
    this._children = children;
  }
  public addChild(route: IRouteChild): RouteChild;
  public addChild(route: RouteChild): RouteChild;
  public addChild(route: RouteChild | IRouteChild) {
    const child =
      route instanceof RouteChild ? route : new RouteChild(route, this);

    if (child.isRedirect) {
      this._children.push(child);
    } else {
      this._children.unshift(child);
    }

    return this;
  }
}
