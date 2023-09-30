import "./koma.css";
import { Koma as KomaProps } from "@/src/state/koma.ts";

export default function Koma(koma: KomaProps) {
  return (
    <div className="koma" style={{ "--r": koma.r, "--c": koma.c }}>
      {koma.getLabel()}
    </div>
  );
}
