
import { Grid, Paper } from "@mui/material";

import { useAppDispatch, useAppSelector } from "../state/stateHooks";
import {
	rotate as rotateTile,
} from "../state/BoardState";


import BoardTile from "./BoardTile";

type BoardProps = {
	onMove: () => void;
	locked: boolean;
};

const Board = (props: BoardProps) => {
	const dispatch = useAppDispatch();

	const board = useAppSelector((state) => state.board.board);

	const onTileClick = (row: number, col: number) => {
		if (!props.locked) dispatch(rotateTile({ x: col, y: row }));
		props.onMove();
	};

	const rowElements = [];
	for (let i = 0; i < board.length; i++) {
		const row = [];
		for (let j = 0; j < board[i].length; j++) {
			const tile = board[i][j];
			row.push(
				<Grid item wrap="nowrap" key={`tile-${i}-${j}`}>
					<BoardTile
						row={i}
						column={j}
						tile={tile}
						onClick={(row, col) => onTileClick(row, col)}
					/>
				</Grid>
			);
		}

		rowElements.push(
			<Grid
				key={`row-${i}`}
				container
				direction="row"
				wrap="nowrap"
				justifyContent="center"
				alignItems="center">
				{row}
			</Grid>
		);
	}

	return (
		<Paper>
			<Grid
				container
				direction="column"
				wrap="nowrap"
				justifyContent="center"
				alignItems="center">
				{rowElements}
			</Grid>
		</Paper>
	);
};

export default Board;
