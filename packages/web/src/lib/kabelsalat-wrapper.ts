import type { EvalMessage } from "@flok-editor/session";
import {
  SalatRepl
} from "@kabelsalat/web";
// import { updateDocumentsContext } from "./utils";

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

  async importModules() {
    // import desired modules and add them to the eval scope
    // await evalScope(
    //   import("@kabelsalat/web"),
    // );
  }

  async initAudio() {
    if (this._audioInitialized) return;
    // await initAudio();
    this._audioInitialized = true;
  }

  async initialize() {
    if (this.initialized) return;

    // let lastFrame: number | null = null;
    // this.framer = new Framer(
    //   () => {
    //     const phase = this._repl.scheduler.now();
    //     if (lastFrame === null) {
    //       lastFrame = phase;
    //       return;
    //     }
    //     if (!this._repl.scheduler.pattern) {
    //       return;
    //     }
    //     // queries the stack of strudel patterns for the current time
    //     const allHaps = this._repl.scheduler.pattern.queryArc(
    //       Math.max(lastFrame!, phase - 1 / 10), // make sure query is not larger than 1/10 s
    //       phase
    //     );
    //     // filter out haps that are not active right now
    //     const currentFrame = allHaps.filter(
    //       (hap: any) => phase >= hap.whole.begin && phase <= hap.endClipped
    //     );
    //     // iterate over each strudel doc
    //     Object.keys(this._docPatterns).forEach((docId: any) => {
    //       // filter out haps belonging to this document (docId is set in tryEval)
    //       const haps = currentFrame.filter((h: any) => h.value.docId === docId);
    //       // update codemirror view to highlight this frame's haps
    //       updateDocumentsContext(docId, { haps, phase });
    //     });
    //   },
    //   (err: any) => {
    //     console.error("[strudel] draw error", err);
    //   }
    // );

    this._repl = new SalatRepl({
        // base: "https://unpkg.com/@kabelsalat/web@0.0.7/dist/",
      });

    // this.framer.start();

    // For some reason, we need to make a no-op evaluation ("silence") to make
    // sure everything is loaded correctly.
    // const pattern = await this._repl.evaluate(`silence//`);
    // await this._repl.run(pattern);

    this.initialized = true;
  }

  async dispose() {
    if (this.framer) {
      this.framer.stop();
    }
  }

  async tryEval(msg: EvalMessage) {
    if (!this.initialized) await this.initialize();
    try {
      const { body: code } = msg;
      // little hack that injects the docId at the end of the code to make it available in afterEval
      const node = this._repl.evaluate(code);
      this._repl.play(node)
    //   if (pattern) {
    //     this._docPatterns[docId] = pattern.docId(docId); // docId is needed for highlighting
    //     const allPatterns = stack(...Object.values(this._docPatterns));
    //     await this._repl.scheduler.setPattern(allPatterns, true);
    //   }
    } catch (err) {
      console.error(err);
      this._onError(`${err}`);
    }
  }
}