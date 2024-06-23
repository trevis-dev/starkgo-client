import { AccountInterface } from "starknet";
import { Entity } from "@dojoengine/recs";
import { ClientComponents } from "./createClientComponents";
import { ColumnToY, Position, RowToX } from "../utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { ContractComponents } from "./generated/contractComponents";
import type { IWorld } from "./generated/generated";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
    { client }: { client: IWorld },
    _contractComponents: ContractComponents,
    _clientComponents: ClientComponents
) {
    const createGame = async (account: AccountInterface, gameId: number) => {
        const { transaction_hash } = await client.actions.create_game({
            account,
            game_id: gameId,
        });

        console.log(
            await account.waitForTransaction(transaction_hash, {
                retryInterval: 100,
            })
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));
    };

    const joinGame = async (account: AccountInterface, gameId: number) => {
        const { transaction_hash } = await client.actions.join_game({
            account,
            game_id: gameId,
        });

        console.log(
            await account.waitForTransaction(transaction_hash, {
                retryInterval: 100,
            })
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));
    };

    const setBlack = async (account: AccountInterface, gameId: number, toController: boolean) => {
        const entityId = getEntityIdFromKeys([
            BigInt(account.address),
        ]) as Entity;

        try {
            const { transaction_hash } = await client.actions.set_black({
                account,
                game_id: gameId,
                to_controller: toController,
            });

            await account.waitForTransaction(transaction_hash, {
                retryInterval: 100,
            });

            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (e) {
            console.error(e);
        }
    };

    const playMove = async (account: AccountInterface, gameId: number, position: Position) => {
        const entityId = getEntityIdFromKeys([
            BigInt(account.address),
        ]) as Entity;

        try {
            const { transaction_hash } = await client.actions.play_move({
                account,
                game_id: gameId,
                position: {x: RowToX[position.x], y: ColumnToY[position.y]},
            });

            await account.waitForTransaction(transaction_hash, {
                retryInterval: 100,
            });

            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (e) {
            console.error(e);
        }
    };

    const pass = async (account: AccountInterface, gameId: number) => {
        try {
            const { transaction_hash } = await client.actions.pass({
                account,
                game_id: gameId,
            });

            console.log(
                await account.waitForTransaction(transaction_hash, {
                    retryInterval: 100,
                })
            );

            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (e) {
            console.error(e);
        }
    };

    return {
        createGame,
        joinGame,
        setBlack,
        playMove,
        pass,
    };
}
