import React, { useEffect, useState } from "react";
import "./App.css";
import { StringToRow, StringToColumn, Row, Column } from "./utils";
import { useDojo } from "./dojo/useDojo";
import { Entity } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useComponentValue } from "@dojoengine/react";
import BoardCanvas, {GRID_SIZE, type Stone} from "./BoardCanvas";

const movePattern = /[A-I][1-9]/;
const allZeroPattern = /^0+$/;


const Board = (props: { gameId: number, board: BigInt, last_move: number[], myTurn: boolean, myColor?: undefined | "White" | "Black"}) => {
    const [move, setMove] = useState("");
    const [position, setPosition] = useState<{x: Row, y: Column}>({x: Row.None, y: Column.None});
    const {
        setup: {
            systemCalls: { playMove, pass },
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
    let stones = getStones(props.board.toString());

    useEffect(() => {
        stones = getStones(props.board.toString());
    }, [props.board])
    
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
            <BoardCanvas
                stones={stones}
                lastMove={props.last_move}
                playMove={
                    async (x: number, y: number) => {
                        if (!position || !game || !props.myTurn || !props.myColor) return;
                        await playMove(account.account, props.gameId, {x, y});
                    }
                }
            />
            {props.myColor 
            ? <>
                <p>Click on the board or enter your move as Row Letter + Column Number, such as "E5" or "B6":</p>
                <div className="card">
                    <div className="card-row">
                        <input
                            value={move}
                            onChange={handleMoveChange}
                        />
                        <button
                            onClick={async () => {
                                if (!position || !game) return;
                                await playMove(account.account, props.gameId, position);
                                setMove(() => "");
                                resetPosition();
                            }}
                            disabled={!props.myTurn || !position.x}
                        >
                            Play {position.x ? move : ""}
                        </button>
                        
                    </div>
                    <div>
                        <button 
                            disabled={!props.myTurn}
                            onClick={async () => {
                                if (!position || !game) return;
                                await pass(account.account, props.gameId);
                                setMove(() => "");
                                resetPosition();
                            }}
                        >
                            Pass
                        </button>
                    </div>
                </div>
                </>
            : <br/>
            }
        </div>
    );
}


function getStones(board: string) {
    if (allZeroPattern.test(board)) return [];
    const stones: Stone[] = []
    const board4 = BigInt(`0x${board}`).toString(4);
    let position = 1;
    while (position <= board4.length) {
        const val = board4.at(-position);
        if (val != "0") {
            const y = (position - 1) % GRID_SIZE;
            const x = (position -1 - y) / GRID_SIZE;
            stones.push({x, y, color: val == "1" ? "Black": "White"})
        }
        position++;
    }
    return stones;
}


export default Board;
