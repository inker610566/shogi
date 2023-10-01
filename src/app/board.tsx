"use client";

import "./board.css";
import KomaUi from "./koma.tsx";
import { Koma, getKomaRule } from "src/state/koma_rule.ts";
import { KingKoma } from "src/state/koma.ts";
import { Point } from "src/common/type.ts";
import { ROW_NUM, COL_NUM } from "src/common/constant.ts";
import { useState } from "react";

export default function Board() {
  const [selectedKoma, setSelectedKoma] = useState<Point | undefined>(
    undefined,
  );
  const [allKomas, setAllKomas] = useState<Koma[]>([]);
  let nextMap: bool[][]|undefined = undefined;
  if (selectedKoma) {
      const rule = getKomaRule(selectedKoma);
      nextMap = Array.from({length: ROW_NUM}).map(() => 
          Array.from({length: ROW_NUM}).map(() => false)
      );
      for (const cell of rule.getMovablePoints(selectedKoma)) {
          nextMap[cell.r][cell.c] = true;
      }
  }

  function onClickCell(r: number, c: number) {
    const clickedKoma = allKomas.find(
      ({ position: p }) => p.r === r && p.c === c,
    );
    if (selectedKoma) {
        if (nextMap[r][c]) {

        }
    } else {
      if (clickedKoma) {
        setSelectedKoma(clickedKoma);
      }
    }
  }

  function onClickKoma(koma: number) {
    if (!selectedKoma) {
      setSelectedKoma(koma);
    }
  }

  const koma = new KingKoma(0, { r: 3, c: 3 });
  return (
    <div
      className={["board", ...(selectedKoma ? ["select-koma"] : [])].join(" ")}
    >
      {Array.from({ length: ROW_NUM }).map((_, i) => (
        <div className="row" key={i}>
          {Array.from({ length: COL_NUM }).map((_, j) => (
            <div
                className={[
                    "cell",
                    ...(nextMap?.[i]?.[j] ? ["next"] : [])
                ].join(" ")}
              key={`${i}_${j}`}
              onClick={() => onClickCell(i, j)}
            ></div>
          ))}
        </div>
      ))}
      {<KomaUi koma={koma} onClick={() => onClickKoma(koma)} />}
    </div>
  );
}
