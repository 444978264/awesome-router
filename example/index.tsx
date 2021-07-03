import * as React from 'react';
import 'react-app-polyfill/ie11';
import * as ReactDOM from 'react-dom';
import { Link, Switch } from 'react-router-dom';
import { Router, PropsWithRoute } from '../.';

const BrowserRouter = Router.useBrowser();

function A({ children, route }: PropsWithRoute) {
  return (
    <div>
      <h1> A page</h1>
      <button
        onClick={() => {
          route.addChild({
            path: '/3',
            name: 'AChild_3',
            component: AChild_3,
          });
        }}
      >
        add page 3
      </button>
      <Link to="/a/1">A_1 page</Link>
      <Link to="/a/2">A_2 page</Link>
      <Link to="/a/3">A_3 page</Link>
      {children}
    </div>
  );
}

function AChild_1(props: any) {
  console.log(props, 'AChild_1');
  return <div>A child 1 page</div>;
}

function AChild_2(props: any) {
  console.log(props, 'AChild_2');
  return <div>A child 2 page</div>;
}

function AChild_3(props: any) {
  console.log(props, 'AChild_3');
  return <div>A child 3 page</div>;
}

function B() {
  return <div>B page</div>;
}

const router = new Router([
  {
    path: '/a',
    name: 'A',
    component: A,
    routes: [
      {
        name: 'A_1',
        path: '/1',
        component: AChild_1,
      },
      {
        name: 'A_2',
        path: '/2',
        component: AChild_2,
      },
      {
        path: '/*',
        name: 'RedirectA',
        redirect: 'A',
      },
    ],
  },
  {
    name: 'B',
    path: '/b',
    component: B,
  },
]);

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Link to="/a">A page</Link>
        <Link to="/b">B page</Link>
        <Switch>{router.root}</Switch>
      </BrowserRouter>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));