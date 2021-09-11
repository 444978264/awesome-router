import * as React from 'react';
import 'react-app-polyfill/ie11';
import * as ReactDOM from 'react-dom';
import { Link, Switch } from 'react-router-dom';
import { PropsWithRoute, Router } from '../.';

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
      <Link to="/a/1/1997">A_1 page</Link>
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

const router = new Router(
  [
    {
      path: '/a',
      name: 'A',
      component: A,
      middleware: [
        function({ history, computedMatch }) {
          console.log(history, computedMatch, 'A history');
          return new Promise(r => {
            setTimeout(() => {
              r(true);
            }, 5000);
          });
        },
      ],
      routes: [
        {
          name: 'A_1',
          path: '/1/:time',
          component: AChild_1,
          middleware: [
            function({ history, computedMatch }) {
              console.log(history, computedMatch, 'A_1 history');
              return new Promise(r => {
                setTimeout(() => {
                  r(true);
                }, 5000);
              });
            },
          ],
        },
        {
          name: 'A_2',
          path: '/2',
          component: AChild_2,
        },
        {
          path: '/*',
          name: 'RedirectA',
          redirect: 'A_2',
        },
      ],
    },
    {
      name: 'B',
      path: '/b',
      component: B,
    },
  ],
  {
    fallback: 'loading...',
  }
);

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
