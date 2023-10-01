import "./koma.css";
import { Koma as KomaProps, getKomaRule } from "src/state/koma_rule.ts";

export default function Koma({ koma, onClick }: { koma: KomaProps }) {
  const rule = getKomaRule(koma);
  return (
    <div
      className="koma"
      onClick={onClick}
      style={{
        "--r": koma.position.r,
        "--c": koma.position.c,
      }}
    >
      {rule.getLabel(koma)}
    </div>
  );
}
