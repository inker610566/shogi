import "./koma.css";
import { getKomaRule } from "src/rule/koma.ts";
import { Koma as KomaProps } from "src/rule/type.ts";
import { CSSProperties } from "react";

export default function Koma({
  koma,
  onClick,
}: {
  koma: KomaProps;
  onClick: () => void;
}) {
  const rule = getKomaRule(koma);
  return (
    <div
      className={[
        "koma",
        ...[koma.player === 0 ? ["p1"] : []],
        ...[koma.player === 1 ? ["p2"] : []],
      ].join(" ")}
      onClick={onClick}
      style={
        {
          "--r": koma.position.r,
          "--c": koma.position.c,
        } as CSSProperties
      }
    >
      {rule.getLabel(koma)}
    </div>
  );
}
