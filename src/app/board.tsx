import "./board.css";
import Koma from "./koma.tsx";
import {KingKoma} from "src/state/koma.ts";
import {Point} from "src/common/type.ts";

const ROW_N = 9;
const COL_N = 9;

export default function Board() {
  const koma = new KingKoma(0, {r: 3, c: 3});
  return (
    <div className="board">
      {Array.from({ length: ROW_N }).map((_, i) => (
        <div className="row" key={i}>
          {Array.from({ length: COL_N }).map((_, i) => (
            <div className="cell" key={i}></div>
          ))}
        </div>
      ))}
      {<Koma koma={koma} />}
    </div>
  );
}
