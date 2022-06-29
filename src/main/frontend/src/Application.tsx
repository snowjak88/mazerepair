import React, { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "./state/stateHooks";
import { reseed as reseedRNG } from "./state/RNGState";
import {
	reset as resetBoard,
	generate as generateBoard
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
	Hidden,
	IconButton,
	Menu,
	MenuItem,
	Snackbar,
	Toolbar,
	Tooltip,
	Typography,
} from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import { Theme, makeStyles } from "@material-ui/core/styles";

import DoneAllIcon from "@material-ui/icons/DoneAll";
import MenuIcon from "@material-ui/icons/Menu";
import SettingsBackupRestoreIcon from "@material-ui/icons/SettingsBackupRestore";
import ShuffleIcon from "@material-ui/icons/Shuffle";
import RotateRightIcon from "@material-ui/icons/RotateRight";
import TodayIcon from "@material-ui/icons/Today";

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

	const [statsPopupVisible, setStatsPopupVisible] = useState(false);
	const [moveCount, setMoveCount] = useState(0);
	const [boardLocked, setBoardLocked] = useState(false);
	const [boardLockedMessageVisible, setBoardLockedMessageVisible] =
		useState(false);
	const [victoryMessageVisible, setVictoryMessageVisible] = useState(false);

	const rng = useAppSelector((state) => state.rng.rng);
	const isBoardComplete = useAppSelector((state) => state.board.isComplete);

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

    const setUpRngSeedToday = ():void => {
        const now = new Date();
		dispatch(
			reseedRNG(`${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`)
		);
    }
    const setUpRngSeedRandom = ():void => {
        dispatch(
			reseedRNG(
				`${Math.random().toString(36).substring(2, 15)}${Math.random()
					.toString(36)
					.substring(2, 15)}`
			)
		);
    }

	const resetBoardAction = (): void => {
		dispatch(resetBoard());
	};

	const onMove = (): void => {
		if (!boardLocked) setMoveCount(moveCount + 1);
		else setBoardLockedMessageVisible(true);
	};

    useEffect(setUpRngSeedToday, [props.boardRows, props.boardColumns, dispatch]);

	useEffect(() => {
        console.log("Effect: generating board ...");
		dispatch(
				generateBoard({ rows:props.boardRows, columns:props.boardColumns, rng})
			);
	}, [props.boardRows, props.boardColumns, dispatch, rng]);

	useEffect(() => {
		if (isBoardComplete) {
			setVictoryMessageVisible(true);
			setBoardLocked(true);
			dispatch(recordGameMoveCount({ moveCount }));
		}
	}, [isBoardComplete, moveCount, dispatch]);

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
							onClick={() =>
								onGameMenuAction(setUpRngSeedToday)
							}
							aria-label="today's maze">
							<IconButton>
								<TodayIcon />
							</IconButton>
							<Typography>Today's Maze</Typography>
						</MenuItem>
						<MenuItem
							onClick={() =>
								onGameMenuAction(setUpRngSeedRandom)
							}
							aria-label="random maze">
							<IconButton>
								<ShuffleIcon />
							</IconButton>
							<Typography>Random Maze</Typography>
						</MenuItem>
						<Hidden mdUp>
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
						</Hidden>
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
				<Hidden mdUp>
					<Grid item xs={12} alignContent="center">
						<Board locked={boardLocked} onMove={onMove} />
					</Grid>
				</Hidden>
				<Hidden smDown>
					<Grid item xs={9} alignContent="center">
						<Board locked={boardLocked} onMove={onMove} />
					</Grid>
					<Grid item xs={3}>
						<CompletionHistory showHeader />
					</Grid>
				</Hidden>
				<Dialog
					onClose={() => setStatsPopupVisible(false)}
					open={statsPopupVisible}
					aria-labelledby="stats-popup-title">
					<DialogTitle id="stats-popup-title" disableTypography>
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
