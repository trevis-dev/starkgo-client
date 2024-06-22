import React, { useRef, useEffect } from 'react';

export type Stone = { x: number, y: number, color: 'Black' | 'White' };

export const GRID_SIZE = 9;

const CANVAS_SIZE = 500;
const CANVAS_MARGIN = 25;
const CANVAS_PADDING = 30;
const DRAW_SIZE = CANVAS_SIZE - CANVAS_MARGIN  * 2 - CANVAS_PADDING * 2;
const CELL_SIZE = DRAW_SIZE / (GRID_SIZE - 1);

const BoardCanvas = (
    props: {
        stones: Stone[], 
        lastMove: number[], 
        playMove: (x: number, y: number) => void
    }
) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                drawBoard(ctx);
                drawStones(ctx, props.stones);
            }
        }
    }, [props.stones]);

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const gridX = Math.round((x - CANVAS_PADDING - CANVAS_MARGIN) / CELL_SIZE);
            const gridY = Math.round((y - CANVAS_PADDING - CANVAS_MARGIN) / CELL_SIZE);

            if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
                props.playMove(gridY + 1, gridX + 1);
            }
        }
    };

    return (
        <canvas
            ref={canvasRef}
            width={500}
            height={500}
            onClick={handleCanvasClick}
            style={{ margin: "auto", border: '1px solid Black' }}
        />
    );
};

function drawBoard(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.strokeStyle = 'black';

    // Draw rows and columns
    for (let i = 0; i < 9; i++) {
        ctx.beginPath();

        ctx.moveTo(CANVAS_MARGIN + CANVAS_PADDING + i * CELL_SIZE, CANVAS_PADDING + CANVAS_MARGIN);
        ctx.lineTo(CANVAS_MARGIN + CANVAS_PADDING + i * CELL_SIZE, CANVAS_SIZE - CANVAS_PADDING - CANVAS_MARGIN);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(CANVAS_MARGIN + CANVAS_PADDING, CANVAS_MARGIN + CANVAS_PADDING + i * CELL_SIZE);
        ctx.lineTo(CANVAS_SIZE - CANVAS_PADDING - CANVAS_MARGIN, CANVAS_MARGIN + CANVAS_PADDING + i * CELL_SIZE);
        ctx.stroke();
    }

    // Draw labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const letters = 'ABCDEFGHI';
    for (let i = 0; i < GRID_SIZE; i++) {
        ctx.fillText(letters[i], CANVAS_PADDING / 2, CANVAS_MARGIN + CANVAS_PADDING + i * CELL_SIZE);
        ctx.fillText((i + 1).toString(), CANVAS_MARGIN + CANVAS_PADDING + i * CELL_SIZE, CANVAS_PADDING / 2);

        // Opponent's perspective
        ctx.save();
        ctx.translate(CANVAS_SIZE - CANVAS_PADDING / 2, CANVAS_MARGIN + CANVAS_PADDING + i * CELL_SIZE);
        ctx.rotate(Math.PI);
        ctx.fillText(letters[8 - i], 0, 0);
        ctx.restore();

        ctx.save();
        ctx.translate(CANVAS_MARGIN + CANVAS_PADDING + i * CELL_SIZE, CANVAS_SIZE - CANVAS_PADDING / 2);
        ctx.rotate(Math.PI);
        ctx.fillText((9 - i).toString(), 0, 0);
        ctx.restore();
    }

    // Center mark
    ctx.beginPath();
    ctx.arc(CANVAS_MARGIN + CANVAS_PADDING + 4 * CELL_SIZE, CANVAS_MARGIN + CANVAS_PADDING + 4 * CELL_SIZE, 5, 0, 2 * Math.PI);
    ctx.fill();
};

function drawStones (ctx: CanvasRenderingContext2D, stones: Stone[]) {
    stones.forEach((stone) => {
        ctx.beginPath();
        ctx.arc(CANVAS_MARGIN + CANVAS_PADDING + stone.y * CELL_SIZE, CANVAS_MARGIN + CANVAS_PADDING + stone.x * CELL_SIZE, CELL_SIZE / 2 - 2, 0, 2 * Math.PI);
        ctx.fillStyle = stone.color.toLowerCase();
        ctx.fill();
    });
};

export default BoardCanvas;