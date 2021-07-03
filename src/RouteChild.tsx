import { History } from 'history';
import React, {
  ComponentType,
  MutableRefObject,
  PropsWithChildren,
  ReactNode,
  Suspense,
} from 'react';
import {
  generatePath,
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
  middleware?: IMiddleware<MutableRefObject<History<any>>>[];
  routes?: IRouteChild[];
  redirect?: string;
  name: string;
  title?: ReactNode;
  icon?: ReactNode;
}

export type IRouteChild = Omit<RouteProps, 'children'> & IRouterExtra;

export type PropsWithRoute = PropsWithChildren<
  RouteChildrenProps & { route: RouteChild }
>;

export class RouteChild {
  public readonly name: IRouteChild['name'];
  public readonly title: IRouteChild['title'];
  public readonly icon: IRouteChild['icon'];
  private _children: RouteChild[] = [];
  private readonly _middleware: IMiddleware[];
  private readonly _props: RouteProps;
  private _isRedirect: boolean;
  private readonly RouteWrapComponent: ComponentType<RouteProps>;

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

    const RenderView = C ? withRouter(C as ComponentType<any>) : React.Fragment;

    return (
      <RouteWrapComponent {...other} path={this.path} key={this.name}>
        <RenderView />
      </RouteWrapComponent>
    );
  }

  public get children() {
    return (
      <Suspense fallback={null}>
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

  constructor(_options: IRouteChild, private readonly _parent?: RouteChild) {
    const { name, title, icon, middleware = [], redirect, ...props } = _options;
    this.name = name;
    this.title = title;
    this.icon = icon;
    this._props = props;
    this._middleware = middleware;
    this._isRedirect = !!redirect;
    this.RouteWrapComponent = this._middleware.length
      ? withMiddleware<History>(Route, {
          middleware: this._middleware,
        })
      : Route;
  }

  public realPath(params?: Record<string, any>) {
    return generatePath(this.path, params);
  }

  public setChildren(children: RouteChild[]) {
    this._children = children;
  }
  public addChild(route: IRouteChild): RouteChild;
  public addChild(route: RouteChild): RouteChild;
  public addChild(route: RouteChild) {
    const child =
      route instanceof RouteChild ? route : new RouteChild(route, this);
    this._children.unshift(child);
    return this;
  }
}
