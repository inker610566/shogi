import "./koma_promote_dialog.css";
import { getKomaRule } from "src/rule/koma.ts";
import { Koma as KomaProps } from "src/rule/type.ts";
import { CSSProperties } from "react";

export default function KomaPromoteDialog({
  koma,
  onConfirm,
  onDeny,
}: {
  koma: KomaProps;
  onConfirm: () => void;
  onDeny: () => void;
}) {
  const rule = getKomaRule(koma);
  const promotedKoma = Object.assign({}, koma, { isPromoted: true });
  return (
    <div
      className="koma-confirm-dialog"
      style={
        {
          "--r": koma.position.r,
          "--c": koma.position.c,
        } as CSSProperties
      }
    >
      <div className="question">Promote to {rule.getLabel(promotedKoma)}?</div>
      <div className="options">
        <button className="confirm" onClick={() => onConfirm()}>
          Confirm
        </button>
        <button className="deny" onClick={() => onDeny()}>
          Deny
        </button>
      </div>
    </div>
  );
}
