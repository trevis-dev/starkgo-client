import { useComponentValue } from "@dojoengine/react";
import { Entity, getComponentValue } from "@dojoengine/recs";
import React, { useEffect, useState } from "react";
import "./App.css";
import Board from "./Board";
import { getPositionLabel } from "./utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useDojo } from "./dojo/useDojo";

function App() {
    const [gameId, setGameId] = useState<null|number>(null);
    const [selectedGameId, setSelectedGameId] = useState<number>(0);
    const {
        setup: {
            systemCalls: { createGame, joinGame, setBlack },
            clientComponents: { Games },
        },
        account,
    } = useDojo();

    const [clipboardStatus, setClipboardStatus] = useState({
        message: "",
        isError: false,
    });

    useEffect(() => {
        if (clipboardStatus.message) {
            const timer = setTimeout(() => {
                setClipboardStatus({ message: "", isError: false });
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [clipboardStatus.message]);

    const entityId = getEntityIdFromKeys(
        [
            BigInt(selectedGameId),
        ]) as Entity;

    const game = useComponentValue(Games, entityId);
    const isController = account?.account?.address === game?.controller.toString();
    const isOpponent = account?.account?.address === game?.opponent.toString();
    const playerVote = isController 
        ? game.controller_has_black.controller
        : isOpponent
            ? game.controller_has_black.opponent 
            : null;
    const otherVote = isController 
    ? game.controller_has_black.opponent
    : isOpponent
        ? game.controller_has_black.controller 
        : null;
    const has_voted = playerVote?.voted || false;
    const other_has_voted = otherVote?.voted || false;
    const has_black = has_voted 
        ? isController 
            ? playerVote?.controller_has_black 
            : !playerVote?.controller_has_black 
        : false;
    const other_has_black = other_has_voted
    ? isController
        ? !otherVote?.controller_has_black 
        : otherVote?.controller_has_black 
    : false;

    const gameState = game?.state as unknown as String;
    const playerColor = gameState == "Ongoing" 
        ? isController 
            ? game?.controller_has_black.controller.controller_has_black 
                ? "Black" 
                : "White" 
            : game?.controller_has_black.controller.controller_has_black 
                ? "White"
                : "Black"
        : null;

    const myTurn = playerColor === (game?.new_turn_player as unknown as string);


    const handleGameIdChance: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
        const value_int = parseInt(ev.currentTarget.value);
        setGameId(() => value_int);
    }

    const handleRestoreBurners = async () => {
        try {
            await account?.applyFromClipboard();
            setClipboardStatus({
                message: "Burners restored successfully!",
                isError: false,
            });
        } catch (error) {
            setClipboardStatus({
                message: `Failed to restore burners from clipboard`,
                isError: true,
            });
        }
    };

    const GameSelect = (
        <div className="card">
            <div className="card-row">
                <label htmlFor="gameId">Game Id: </label>
                <input 
                    name="gameId"
                    type="number"
                    step="1"
                    value={gameId?.toString() || ""}
                    onChange={handleGameIdChance}

                />
            </div>
            <div className="card-row">
                <button
                    disabled={!gameId}
                    onClick={async () => {
                        if (!gameId) return;
                        await createGame(account.account, gameId);
                        setSelectedGameId(() => gameId);
                    }}
                >Create Game</button>
                <button
                    disabled={!gameId}
                    onClick={async () => {
                        if (!gameId) return;
                        if (!game || game.game_id !== BigInt(gameId)) {
                            const otherGame = getComponentValue(Games, getEntityIdFromKeys([BigInt(gameId)]));
                            if (!otherGame || otherGame?.state as unknown as string === "Created") {
                                await joinGame(account.account, gameId);
                            }
                        }
                        setSelectedGameId(() => gameId);
                    }}
                >Join Game</button>
            </div>
        </div>
    );

    const SetBlack = (
        <div className="card">
            <h3>Choose your color</h3>
            <p>The game will start automatically when players agree.</p>
            <p>Other player's choice is underlined.</p>
            <div className="card-row">
                <button
                    className={
                        `${has_voted && has_black ? "active" : ""} `
                        + `${other_has_voted && other_has_black ? "other-active" : ""}`
                    }
                    onClick={async () => {
                        if (!gameId || !game || has_black) return;
                        await setBlack(account.account, gameId, isController);
                    }}
                >Take Black</button>
                <button
                    className={
                        `${has_voted && !has_black ? "active" : ""} `
                        + `${other_has_voted && !other_has_black ? "other-active" : ""}`
                    } 
                    onClick={async () => {
                        if (!gameId || !game || has_voted && !has_black) return;
                        await setBlack(account.account, gameId, !isController);
                    }}
                >Take White</button>
            </div>
        </div>
    )

    return (
        <>
            <button onClick={() => account?.create()}>
                {account?.isDeploying ? "deploying burner" : "create burner"}
            </button>
            {account && account?.list().length > 0 && (
                <button onClick={async () => await account?.copyToClipboard()}>
                    Save Burners to Clipboard
                </button>
            )}
            <button onClick={handleRestoreBurners}>
                Restore Burners from Clipboard
            </button>
            {clipboardStatus.message && (
                <div className={clipboardStatus.isError ? "error" : "success"}>
                    {clipboardStatus.message}
                </div>
            )}
            <hr/>
            <div className="card">
                <div>{`burners deployed: ${account.count}`}</div>
                <div>
                    select signer:{" "}
                    <select
                        value={account ? account.account.address : ""}
                        onChange={(e) => account.select(e.target.value)}
                    >
                        {account?.list().map((account, index) => {
                            return (
                                <option value={account.address} key={index}>
                                    {account.address}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <div>
                    <button onClick={() => account.clear()}>
                        Clear burners
                    </button>
                    <p>
                        You will need to Authorise the contracts before you can
                        use a burner. See readme.
                    </p>
                </div>
            </div>
            <hr/>
            {!selectedGameId && GameSelect}
            {gameState === "Created" ? <div>Waiting for opponent...</div> : null}
            {selectedGameId != 0 && gameState === "Joined" && SetBlack}

            {game && gameId && gameState === "Ongoing" && playerColor ? 
                <>
                    <div>Prisoners - Black: {game.prisoners.black} | White: {game.prisoners.white} </div>
                    <p style={{textDecoration : myTurn ? "underline" : "none"}}>
                        {myTurn ? `It's your turn ! [${playerColor}]` : `It's your opponent's turn (${playerColor === "White" ? "Black": "White" })`}
                    </p>
                    {game.nb_moves?myTurn ?
                        game?.last_passed 
                        ? <p style={{fontStyle: "italic"}}>Your opponent passed.</p> 
                        : game?.previous_board
                            ? <p style={{fontStyle: "italic"}}>Your opponent played {getPositionLabel(game.last_move)}.</p> 
                            : null
                        :game?.last_passed 
                        ? <p style={{fontStyle: "italic"}}>You passed.</p> 
                        : game?.previous_board
                            ? <p style={{fontStyle: "italic"}}>You just played {getPositionLabel(game.last_move)}.</p> 
                            : null
                    :null
                    }
                    <Board 
                        gameId={gameId}
                        board={game.board}
                        myTurn={myTurn}
                        myColor={playerColor}
                    />
                </>
                : null}
                <hr/>
            {selectedGameId 
                ? <div>
                    <button 
                        style={{ marginTop: 20, float: "inline-start" }} 
                        onClick={() => setSelectedGameId(() => 0)}
                    >Switch game</button>
                </div>
                : null
            }
        </>
    );
}

export default App;
