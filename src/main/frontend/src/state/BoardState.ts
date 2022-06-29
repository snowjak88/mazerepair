import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Direction from "../game/Direction";
import { RNG } from "../game/Random";

import Tile from "../game/Tile";
import TileRepository from "../game/TileRepository";
import { Cloneable } from "./Cloneable";

type BoardState = {
	board: Tile[][];
	startingBoard: Tile[][];
	isComplete: boolean;
};

const initialState: BoardState = {
	board: new Array<Tile[]>(new Array<Tile>()),
	startingBoard: new Array<Tile[]>(new Array<Tile>()),
	isComplete: false,
};

const clone2DArray = function (array: Cloneable[][]): Cloneable[][] {
	return array.map((row) => row.map((v) => v.clone()));
};
const shuffleArray = function <T>(array: T[], rng: RNG): T[] {
	const shuffled = Array.from(array);
	for (let i = 0; i < array.length; i++) {
		const j = Math.floor(rng() * (i + 1));
		const first = shuffled[i];
		shuffled[i] = shuffled[j];
		shuffled[j] = first;
	}
	return shuffled;
};

const cardinalDirections: Direction[] = [
	Direction.NORTH,
	Direction.EAST,
	Direction.SOUTH,
	Direction.WEST,
];

const isTileFitting = (
	board: (Tile | null)[][],
	row: number,
	column: number
): boolean => {
	if (row < 0 || row >= board.length) return true;
	if (column < 0 || column >= board[row].length) return true;
	const tile = board[row][column];
	if (!tile) return true;

	return cardinalDirections.every((d) => {
		var { dx, dy } = Direction.toDxDy(d);
		var nx = column + dx,
			ny = row + dy;

		if (ny < 0 || ny >= board.length) return true;
		if (nx < 0 || nx >= board[ny].length) return true;

		var nTile = board[ny][nx];
		if (!nTile) return true;

		return tile.hasPathTo(d) === nTile.hasPathTo(Direction.opposite(d));
	});
};

const isBoardComplete = (board: (Tile | null)[][]): boolean =>
	board.every((row, rowIdx) =>
		row.every((col, colIdx) => isTileFitting(board, rowIdx, colIdx))
	);

const generateBoard = (
	board: (Tile | null)[][],
	rng: RNG,
	row: number = 0,
	column: number = 0
): boolean => {
	if (row >= board.length) return true;
	if (column >= board[row].length)
		return generateBoard(board, rng, row + 1, 0);

	//
	// Iterate across all possible Tiles for this row/column.
	for (let tile of shuffleArray(
		TileRepository.getInstance().getTiles(),
		rng
	)) {
		//
		// Does this tile fit in this board?
		board[row][column] = tile;
		if (!isTileFitting(board, row, column)) continue;
		//
		// Attempt to depth-recurse to find the next tile.
		const recurseResult = generateBoard(board, rng, row, column + 1);
		if (recurseResult) return true;
	}

	board[row][column] = null;
	return false;
};

const shuffleBoard = (board: Tile[][], rng: RNG): void => {
	for (let y = 0; y < board.length; y++)
		for (let x = 0; x < board[y].length; x++)
			board[y][x] = board[y][x]?.rotate(Math.floor(rng() * 4));
};

const boardSlice = createSlice({
	name: "board",
	initialState,
	reducers: {
		reset: (state: BoardState) => {
			state.board = clone2DArray(state.startingBoard) as Tile[][];
			state.isComplete = isBoardComplete(state.board);
		},
		set: (state: BoardState, action: PayloadAction<Tile[][]>) => {
			state.board = clone2DArray(action.payload) as Tile[][];
			state.startingBoard = clone2DArray(action.payload) as Tile[][];
			state.isComplete = isBoardComplete(state.board);
		},
		rotate: (
			state: BoardState,
			action: PayloadAction<{ x: number; y: number }>
		) => {
			var { x, y } = action.payload;
			console.log(`rotate tile: (x = ${x}, y = ${y})`);
			if (y < 0 || y >= state.board.length) return;
			if (x < 0 || x >= state.board[y].length) return;
			if (!state.board[y][x]) return;

			state.board[y][x] = state.board[y][x].rotate();
			state.isComplete = isBoardComplete(state.board);
		},
		shuffle: (state: BoardState, action: PayloadAction<RNG>) => {
			shuffleBoard(state.board, action.payload);

			state.isComplete = isBoardComplete(state.board);
		},
		generate: (
			state: BoardState,
			action: PayloadAction<{ rows: number; columns: number; rng: RNG }>
		) => {
			const board: (Tile | null)[][] = Array(action.payload.rows);
			for (let i = 0; i < board.length; i++)
				board[i] = Array<Tile | null>(action.payload.columns);

			while (!generateBoard(board, action.payload.rng))
				console.log(`Re-generating board ...`);

			shuffleBoard(board as Tile[][], action.payload.rng);

			state.board = board as Tile[][];
			state.startingBoard = board as Tile[][];
			state.isComplete = isBoardComplete(state.board);
		},
	},
});

export const { reset, set, rotate, shuffle, generate } = boardSlice.actions;
export default boardSlice.reducer;
