import React, { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "./state/stateHooks";
import { reseed as reseedRNG } from "./state/RNGState";
import {
	reset as resetBoard,
	generate as generateBoard,
} from "./state/BoardState";
import { recordGameMoveCount } from "./state/StatsState";

import {
	AppBar,
	Badge,
	Box,
	Container,
	Dialog,
	DialogTitle,
	Divider,
	Grid,
	IconButton,
	Menu,
	MenuItem,
	Snackbar,
	Toolbar,
	Tooltip,
	Typography,
	useMediaQuery,
	Theme
} from "@mui/material";
import { Alert, AlertTitle } from "@mui/lab";
import { makeStyles } from "@mui/styles";

import DoneAllIcon from "@mui/icons-material/DoneAll";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsBackupRestoreIcon from "@mui/icons-material/SettingsBackupRestore";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import TodayIcon from "@mui/icons-material/Today";

import Board from "./components/Board";
import CompletionHistory from "./components/CompletionHistory";

type ApplicationProp = {
	boardRows: number;
	boardColumns: number;
};

const useStyles = makeStyles((theme: Theme) => ({
	menuButton: {
		marginRight: theme.spacing(2),
	},
}));

const Application = (props: ApplicationProp) => {
	const dispatch = useAppDispatch();
	const classes = useStyles();

	const [gameMenuOpen, setGameMenuOpen] = useState(false);
	const [gameMenuAnchorElement, setGameMenuAnchorElement] =
		useState<Element>();

	const [moveCount, setMoveCount] = useState(0);
	const [isTodayPuzzle, setIsTodayPuzzle] = useState(false);
	const [boardLocked, setBoardLocked] = useState(false);

	const [statsPopupVisible, setStatsPopupVisible] = useState(false);
	const [todayPuzzleSolvedPopupVisible, setTodayPuzzleSolvedPopupVisible] =
		useState(false);
	const [boardLockedMessageVisible, setBoardLockedMessageVisible] =
		useState(false);
	const [victoryMessageVisible, setVictoryMessageVisible] = useState(false);

	const rng = useAppSelector((state) => state.rng.rng);
	const board = useAppSelector((state) => state.board.board);
	const isBoardComplete = useAppSelector((state) => state.board.isComplete);
	const solvedPuzzleForDay = useAppSelector(
		(state) => state.stats.solvedPuzzleForDay
	);

	const onGameMenuOpenClick = (
		e: React.MouseEvent<Element, MouseEvent>
	): void => {
		setGameMenuOpen(true);
		setGameMenuAnchorElement(e.target as unknown as Element);
	};
	const onGameMenuAction = (action: () => void): void => {
		setGameMenuOpen(false);
		setGameMenuAnchorElement(undefined);
		action?.();
	};

	const buildTodayString = (): string => {
		const now = new Date();
		return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
	};

	//
	// Game UI state-transitions:
	//
	// Set up the appropriate RNG.
	//
	// When RNG changes = new game:
	//   If it's a "today-game" and we've already played today:
	//      Lock the board. Display the "no more today" popup.
	//   Otherwise:
	//      Generate a fresh board. Ensure it's unlocked.
	//
	// When the board is complete and not locked:
	//   Show the victory popup.
	//   Record the victory.
	//   Lock the board.
	//

	const setUpRngSeedToday = (): void => {
		dispatch(reseedRNG(buildTodayString()));
		setIsTodayPuzzle(true);
	};
	const setUpRngSeedRandom = (): void => {
		dispatch(
			reseedRNG(
				`${Math.random().toString(36).substring(2, 15)}${Math.random()
					.toString(36)
					.substring(2, 15)}`
			)
		);
		setIsTodayPuzzle(false);
	};

	const resetBoardAction = (): void => {
		if (isTodayPuzzle && solvedPuzzleForDay === buildTodayString()) {
			setBoardLocked(true);
			setTodayPuzzleSolvedPopupVisible(true);
		} else {
			dispatch(resetBoard());
                        setMoveCount(0);
			setBoardLocked(false);
		}
	};

	const onMove = (): void => {
		if (!boardLocked) setMoveCount(moveCount + 1);
		else setBoardLockedMessageVisible(true);
	};

	//
	// Default effect. When the component is (re-)created,
	// set up today's game as the RNG.
	useEffect(setUpRngSeedToday, [
		props.boardRows,
		props.boardColumns,
		dispatch,
	]);

	//
	// When the RNG changes:
	// If this is a "today game" and we've already played today:
	//   Lock the board.
	//   Display the "no more today game" popup.
	// Otherwise:
	//   Generate a fresh board using the RNG.
	//   Unlock the board.
	useEffect(() => {
		const todayString = buildTodayString();
		const todayAlreadyPlayed = solvedPuzzleForDay === todayString;

		if (isTodayPuzzle && todayAlreadyPlayed) {
			setBoardLocked(true);
			setTodayPuzzleSolvedPopupVisible(true);
		} else {
			dispatch(
				generateBoard({
					rows: props.boardRows,
					columns: props.boardColumns,
					rng,
				})
			);
                        setMoveCount(0);
			setBoardLocked(false);
		}
	}, [
		props.boardRows,
		props.boardColumns,
		rng,
		solvedPuzzleForDay,
		isTodayPuzzle,
		dispatch,
	]);

	//
	// When the board is complete and not locked:
	//   Show the victory popup.
	//   Record the victory.
	//   Lock the board.
	useEffect(() => {
		if (board && isBoardComplete && !boardLocked) {
			setVictoryMessageVisible(true);
			setBoardLocked(true);
			dispatch(
				recordGameMoveCount({
					moveCount,
					puzzleForDay: isTodayPuzzle
						? buildTodayString()
						: undefined,
				})
			);
		}
	}, [
		board,
		isBoardComplete,
		boardLocked,
		moveCount,
		isTodayPuzzle,
		dispatch,
	]);

	return (
		<Container>
			<AppBar position="static" color="transparent">
				<Toolbar>
					<IconButton
						onClick={onGameMenuOpenClick}
						color="primary"
						aria-label="game menu"
						aria-controls="game-menu">
						<MenuIcon />
					</IconButton>
					<Menu
						id="game-menu"
						className={classes.menuButton}
						anchorEl={gameMenuAnchorElement}
						open={gameMenuOpen}
						onClose={() => setGameMenuOpen(false)}>
						<MenuItem
							onClick={() => onGameMenuAction(setUpRngSeedToday)}
							aria-label="today's maze">
							<IconButton>
								<TodayIcon />
							</IconButton>
							<Typography>Today's Maze</Typography>
						</MenuItem>
						<MenuItem
							onClick={() => onGameMenuAction(setUpRngSeedRandom)}
							aria-label="random maze">
							<IconButton>
								<ShuffleIcon />
							</IconButton>
							<Typography>Random Maze</Typography>
						</MenuItem>
						{useMediaQuery((theme: Theme) =>
							theme.breakpoints.up("md")
						) ? null : (
							<>
								<Divider variant="middle" />
								<MenuItem
									onClick={() =>
										onGameMenuAction(() =>
											setStatsPopupVisible(true)
										)
									}
									aria-label="show stats">
									<IconButton>
										<DoneAllIcon />
									</IconButton>
									<Typography>Stats</Typography>
								</MenuItem>
							</>
						)}
						<Divider variant="middle" />
						<MenuItem
							onClick={() => onGameMenuAction(resetBoardAction)}
							aria-label="reset board">
							<IconButton>
								<SettingsBackupRestoreIcon />
							</IconButton>
							<Typography>Reset Board</Typography>
						</MenuItem>
					</Menu>
					<Box sx={{ mr: "auto" }}>
						<Typography variant="h4">Maze Repair</Typography>
					</Box>
					<Tooltip title="# Moves">
						<Badge
							badgeContent={moveCount}
							showZero
							color={boardLocked ? "primary" : "secondary"}>
							<RotateRightIcon />
						</Badge>
					</Tooltip>
				</Toolbar>
			</AppBar>
			<Grid container wrap="nowrap" direction="row">
				{useMediaQuery((theme: Theme) => theme.breakpoints.up("md")) ? (
					<>
						<Grid item xs={9} alignContent="center">
							<Board locked={boardLocked} onMove={onMove} />
						</Grid>
						<Grid item xs={3}>
							<CompletionHistory showHeader />
						</Grid>
					</>
				) : (
					<Grid item xs={12} alignContent="center">
						<Board locked={boardLocked} onMove={onMove} />
					</Grid>
				)}
				<Dialog
					onClose={() => setStatsPopupVisible(false)}
					open={statsPopupVisible}
					aria-labelledby="stats-popup-title">
					<DialogTitle id="stats-popup-title">
						<Typography variant="h6">Stats</Typography>
					</DialogTitle>
					<CompletionHistory />
				</Dialog>
			</Grid>
			<Snackbar open={boardLockedMessageVisible} autoHideDuration={3000}>
				<Alert
					severity="info"
					onClose={() => setBoardLockedMessageVisible(false)}>
					<AlertTitle>Board Locked</AlertTitle>
					Maze is completed. Use the menu to generate another maze.
				</Alert>
			</Snackbar>
			<Snackbar
				open={todayPuzzleSolvedPopupVisible}
				autoHideDuration={3000}>
				<Alert
					severity="info"
					onClose={() => setTodayPuzzleSolvedPopupVisible(false)}>
					<AlertTitle>Today's Puzzle Already Solved</AlertTitle>
					You've already solved today's puzzle. Use the menu to
					generate a random maze.
				</Alert>
			</Snackbar>
			<Snackbar
				open={victoryMessageVisible}
				autoHideDuration={10000}
				onClose={() => setVictoryMessageVisible(false)}>
				<Alert
					onClose={() => setVictoryMessageVisible(false)}
					severity="success">
					<AlertTitle>Completed!</AlertTitle>
					You solved the maze in {moveCount} moves.
				</Alert>
			</Snackbar>
		</Container>
	);
};

export default Application;
