import { createBrowserHistory, createHashHistory, History as H } from 'history';

export type IHistoryState = Record<string, any>;

export interface IHistory {
  mode: 'hash' | 'history';
}

export class History {
  private readonly _history: H<IHistoryState>;
  constructor({ mode = 'hash' }: IHistory) {
    this._history = this._createHistory(mode);
  }

  get history() {
    return this._history;
  }

  private _createHistory(mode: IHistory['mode']): H<IHistoryState> {
    return mode === 'history' ? createBrowserHistory() : createHashHistory();
  }

  push(path: string) {
    this._history.push(path);
  }

  replace(path: string) {
    this._history.replace(path);
  }
}
