import type { EvalMessage } from "@flok-editor/session";
import { SalatRepl } from "@kabelsalat/web";

export type ErrorHandler = (error: string) => void;

export class KabelsalatWrapper {
  initialized: boolean = false;

  protected _onError: ErrorHandler;
  protected _onWarning: ErrorHandler;
  protected _repl: any;
  protected _docPatterns: any;
  protected _audioInitialized: boolean;
  protected framer?: any;

  constructor({
    onError,
    onWarning,
  }: {
    onError: ErrorHandler;
    onWarning: ErrorHandler;
  }) {
    this._docPatterns = {};
    this._onError = onError || (() => {});
    this._onWarning = onWarning || (() => {});
    this._audioInitialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    this._repl = new SalatRepl({
      localScope: true,
    });

    this.initialized = true;
  }

  async tryEval(msg: EvalMessage) {
    if (!this.initialized) await this.initialize();

    try {
      const { body: code, docId } = msg;
      const node = await this._repl.evaluate(code);
      if (node) {
        this._docPatterns[docId] = code;
        // concatenate all kabelsalat panes
        // bit of a problem because they all restart
        const allPatterns = Object.values(this._docPatterns).join("\n\n");
        await this._repl.run(allPatterns);
      }
      // this._repl.run(code)
    } catch (err) {
      console.error(err);
      this._onError(`${err}`);
    }
  }
}
