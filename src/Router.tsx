import { createBrowserHistory, createHashHistory, History } from 'history';
import React from 'react';
import { Redirect, Router as Wrap, RouterProps } from 'react-router-dom';
import { IRouteChild, RouteChild } from './RouteChild';

export class Router {
  static history: History<any> = createBrowserHistory();
  static useHash() {
    Router.history = createHashHistory();
    return Router.Wrap;
  }
  static useBrowser() {
    Router.history = createBrowserHistory();
    return Router.Wrap;
  }
  static Wrap(props: Omit<RouterProps, 'history'>) {
    return <Wrap {...props} history={Router.history} />;
  }

  private _routeMap: Record<string, RouteChild> | null = null;
  private _tree: RouteChild[] = [];

  constructor(private _options: IRouteChild[]) {
    this._tree = this._iterateTree(this._options);
  }

  get root() {
    return this._tree.map(route => route.root);
  }

  get currentRoute() {
    return Object.values(this._routeMap!).find(route => {
      return route.isExact;
    });
  }

  private _iterateTree(routeConfigs: IRouteChild[], parent?: RouteChild) {
    if (this._routeMap === null) {
      this._routeMap = {};
    }

    const children: RouteChild[] = [];

    for (const routeConfig of routeConfigs) {
      if (!routeConfig.render && routeConfig.redirect) {
        const path =
          this._routeMap[routeConfig.redirect]?.path ?? routeConfig.redirect;
        routeConfig.render = function() {
          return <Redirect to={path} />;
        };
      }

      const route = new RouteChild(routeConfig, parent);

      if (!routeConfig.redirect) {
        Reflect.set(this._routeMap, routeConfig.name, route);
      }

      if (Array.isArray(routeConfig.routes) && routeConfig.routes.length) {
        route.setChildren(this._iterateTree(routeConfig.routes, route));
      }

      children.push(route);
    }

    return children;
  }

  public pick(names: string[]) {
    const result: RouteChild[] = [];
    if (this._routeMap) {
      names.forEach(name => {
        if (Reflect.has(this._routeMap!, name)) {
          result.push(this._routeMap![name]);
        }
      });
    }
    return result;
  }

  public getRoute(name: IRouteChild['name']): RouteChild {
    if (this._routeMap && Reflect.has(this._routeMap, name)) {
      return Reflect.get(this._routeMap, name);
    }
    throw Error(
      `There is no route called ${name}.\nYou need to configure it first !`
    );
  }

  public addRoute(
    parent: string | RouteChild,
    route: RouteChild | IRouteChild
  ): void;
  public addRoute(route: RouteChild | IRouteChild): void;
  public addRoute(...args: any[]) {
    if (args.length > 1) {
      const [parent, child] = args;
      if (parent instanceof RouteChild) {
        parent.addChild(child);
      } else if (typeof parent === 'string') {
        this.getRoute(parent).addChild(child);
      }
    } else if (args.length === 1) {
      const child =
        args[0] instanceof RouteChild ? args[0] : new RouteChild(args[0]);
      this._tree.unshift(child);
    }
    return this;
  }
}
