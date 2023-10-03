import "./koma.css";
import { Koma as KomaProps, getKomaRule } from "src/rule/koma.ts";

export default function Koma({ koma, onClick }: { koma: KomaProps }) {
  const rule = getKomaRule(koma);
  return (
    <div
      className={[
        "koma",
        ...[koma.player === 0 ? ["p1"] : []],
        ...[koma.player === 1 ? ["p2"] : []],
      ].join(" ")}
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
