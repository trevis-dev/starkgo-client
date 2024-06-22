import React, { useState } from "react";
import "./App.css";
import { StringToRow, StringToColumn, Row, Column } from "./utils";
import { useDojo } from "./dojo/useDojo";
import { Entity, Type } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useComponentValue } from "@dojoengine/react";

const movePattern = /[A-I][1-9]/;

const Board = (props: { gameId: number, board: BigInt, myTurn: boolean, myColor: "White" | "Black"}) => {
    const [move, setMove] = useState("");
    const [position, setPosition] = useState<{x: Row, y: Column}>({x: Row.None, y: Column.None});
    const {
        setup: {
            systemCalls: { playMove },
            clientComponents: { Games },
        },
        account,
    } = useDojo();
    const entityId = getEntityIdFromKeys(
        [BigInt(props.gameId)]
    ) as Entity;
    const resetPosition = () => {
        setPosition(() => ({ x: Row.None, y: Column.None }));

    }
    const game = useComponentValue(Games, entityId);

    const handleMoveChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
        const newMove = ev.currentTarget.value;
        if (movePattern.test(ev.currentTarget.value)) {
            const [x, y] = ev.currentTarget.value;
            setPosition(() => ({ x: StringToRow[x as keyof (typeof StringToRow)], y: StringToColumn[y as keyof (typeof StringToColumn)]}));
        } else {
            resetPosition();       
        }
        setMove(() => newMove);
    }
    return (
        <div>
            <p>Board: {props.board.toString()}</p>
            <p>Enter move as Row Letter + Column Number, such as "E5" or "B6":</p>
            <div className="card">
                <div className="card-row">
                    <input
                        value={move}
                        onChange={handleMoveChange}
                    />
                    <button
                        onClick={async () => {
                            if (!position || !game) return;
                            console.log(position);
                            debugger;
                            await playMove(account.account, props.gameId, position);
                            setMove(() => "");
                            resetPosition();
                        }}
                        disabled={!props.myTurn || !position.x}
                    >
                        Play {position.x ? move : ""}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Board;
