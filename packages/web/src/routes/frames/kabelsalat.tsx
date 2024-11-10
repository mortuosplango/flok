import { useEvalHandler } from "@/hooks/use-eval-handler";
import { KabelsalatWrapper } from "@/lib/kabelsalat-wrapper";
import { sendToast } from "@/lib/utils";
import { type EvalMessage } from "@flok-editor/session";
import { useCallback, useEffect, useState } from "react";

export function Component() {
  const [instance, setInstance] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const instance = new KabelsalatWrapper({
        onError: (err) => {
          sendToast("destructive", "Kabelsalat error", err.toString());
        },
        onWarning: (msg) => {
          sendToast("warning", "Kabelsalat warning", msg);
        },
      });

      setInstance(instance);

      window.parent.kabelsalat = window;
    })();
  }, []);

  useEvalHandler(
    useCallback(
      (msg: EvalMessage) => {
        if (!instance) return;
        instance.tryEval(msg);
      },
      [instance]
    )
  );

  return null;
}
