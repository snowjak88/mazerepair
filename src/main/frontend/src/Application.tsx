import React from "react";

import { AppBar, Badge, Box, Container, Divider, Grid, IconButton, Menu, MenuItem, Snackbar, Toolbar, Tooltip, Typography } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import { withStyles, Theme } from '@material-ui/core/styles';

import MenuIcon from '@material-ui/icons/Menu';
import SettingsBackupRestoreIcon from '@material-ui/icons/SettingsBackupRestore';
import ShuffleIcon from '@material-ui/icons/Shuffle';
import RotateRightIcon from '@material-ui/icons/RotateRight';
import TodayIcon from '@material-ui/icons/Today';

import Direction from "./game/Direction";
import Tile from "./game/Tile";
import TileRepository from './game/TileRepository';
import Board from "./components/Board";
import CompletionHistory from "./components/CompletionHistory";

type ApplicationProp = {};

type ApplicationState = {
    seed: string;
    currentMoveCount: number;

    victoryMoveCount?: number;
    victoryMessageVisible: boolean;

    boardLocked: boolean;
    boardLockedMessageVisible: boolean;

    gameMenuOpen: boolean;
    gameMenuAnchor?: HTMLElement | null;
}

const styles = (theme: Theme) => ({
    root: {

    },
    menuButton: {
        marginRight: theme.spacing(2)
    }
});

class Application extends React.Component<ApplicationProp, ApplicationState> {

    private completionHistoryListener: ((moveCount:number) => void) | null = null;
    private resetBoardListener: (() => void) | null = null;

    constructor(props: ApplicationProp) {
        super(props);

        this.state = {
            seed: Application.getTodayString(),
            currentMoveCount: 0,
            victoryMessageVisible: false,
            boardLocked: false,
            boardLockedMessageVisible: false,
            gameMenuOpen: false,
            gameMenuAnchor: null
        };

        this.gameMenuOpen = this.gameMenuOpen.bind(this);
        this.gameMenuClose = this.gameMenuClose.bind(this);
        this.gameOver = this.gameOver.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onBlockedMove = this.onBlockedMove.bind(this);
        this.randomPuzzle = this.randomPuzzle.bind(this);
        this.reset = this.reset.bind(this);
        this.todayPuzzle = this.todayPuzzle.bind(this);
        this.closeBoardLockedPopup = this.closeBoardLockedPopup.bind(this);
        this.closeVictoryPopup = this.closeVictoryPopup.bind(this);
    }

    private static getTodayString(): string {
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    }

    private static getRandomString(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    private onMove() {
        this.setState({
            currentMoveCount: ( this.state?.currentMoveCount || 0 ) + 1
        });
    }

    private onBlockedMove() {
        this.setState({
            boardLockedMessageVisible: true
        });
    }

    private reset() {
        this.setState({
            currentMoveCount: 0,
            victoryMessageVisible: false,
            boardLocked: false
        }, () => this.resetBoardListener?.());
    }

    private randomPuzzle() {
        this.setState({
            seed: Application.getRandomString(),
            currentMoveCount: 0,
            victoryMessageVisible: false,
            boardLocked: false
        });
    }

    private todayPuzzle() {
        this.setState({
            seed: Application.getTodayString(),
            currentMoveCount: 0,
            victoryMessageVisible: (this.state.seed === Application.getTodayString() && this.state.victoryMessageVisible),
            boardLocked: (this.state.seed === Application.getTodayString() && this.state.boardLocked)
        });
    }

    private gameOver(moveCount:number) {
        this.completionHistoryListener?.(moveCount);
        this.setState({
            victoryMoveCount: moveCount,
            victoryMessageVisible: true,
            boardLocked: true
        });
    }

    private gameMenuOpen(event: React.MouseEvent<HTMLElement>) {
        this.setState({
            gameMenuOpen: true,
            gameMenuAnchor: event?.currentTarget
        });
    }

    private gameMenuClose() {
        this.setState({
            gameMenuOpen: false,
            gameMenuAnchor: null
        });
    }

    private closeBoardLockedPopup() {
        this.setState({
            boardLockedMessageVisible: false
        });
    }

    private closeVictoryPopup() {
        this.setState({
            victoryMessageVisible: false
        });
    }

    render() {
        return (
                <Container className={styles.root}>
                    <AppBar position="static" color="transparent">
                        <Toolbar>
                            <IconButton onClick={this.gameMenuOpen} color="primary"
                                    aria-label="game menu" aria-controls="game-menu" aria-popup="true">
                                <MenuIcon />
                            </IconButton>
                            <Menu id="game-menu" className={styles.menuButton}
                                    anchorEl={this.state.gameMenuAnchor} open={this.state.gameMenuOpen} onClose={this.gameMenuClose}>
                                <MenuItem onClick={() => { this.gameMenuClose(); this.todayPuzzle(); }}
                                        aria-label="today's maze">
                                    <IconButton>
                                        <TodayIcon />
                                    </IconButton>
                                    <Typography>Today's Maze</Typography>
                                </MenuItem>
                                <MenuItem onClick={() => { this.gameMenuClose(); this.randomPuzzle(); }}
                                        aria-label="random maze">
                                    <IconButton>
                                        <ShuffleIcon />
                                    </IconButton>
                                    <Typography>Random Maze</Typography>
                                </MenuItem>
                                <Divider variant="middle"/>
                                <MenuItem onClick={() => { this.gameMenuClose(); this.reset(); }}
                                        aria-label="reset board">
                                    <IconButton>
                                        <SettingsBackupRestoreIcon />
                                    </IconButton>
                                    <Typography>Reset Board</Typography>
                                </MenuItem>
                            </Menu>
                            <Box sx={{ mr: "auto" }}>
                                <Typography variant="h4">
                                    Maze Repair
                                </Typography>
                            </Box>
                            <Tooltip title="# Moves">
                                <Badge badgeContent={this.state.currentMoveCount} showZero
                                        color={this.state.boardLocked ? "primary" : "secondary"}>
                                    <RotateRightIcon />
                                </Badge>
                            </Tooltip>
                        </Toolbar>
                    </AppBar>
                    <Grid container wrap="nowrap" direction="row">
                        <Grid item xs={9} alignContent="center">
                            <Board rows={5} cols={5} seed={this.state.seed} locked={this.state.boardLocked}
                                    onMove={this.onMove} onBlockedMove={this.onBlockedMove}
                                    onValidBoard={this.gameOver} />
                        </Grid>
                        <Grid item xs={3}>
                            <CompletionHistory registerCompletionListener={(listener) => this.completionHistoryListener = listener}
                                    unregisterCompletionListener={() => this.completionHistoryListener = null} />
                        </Grid>
                    </Grid>
                    <Snackbar open={this.state.boardLockedMessageVisible} autoHideDuration={3000}>
                        <Alert severity="info" onClose={this.closeBoardLockedPopup}>
                            <AlertTitle>
                                Board Locked
                            </AlertTitle>
                            Maze is completed. Use the menu to generate another maze.
                        </Alert>
                    </Snackbar>
                    <Snackbar open={this.state.victoryMessageVisible} autoHideDuration={10000}
                            onClose={this.closeVictoryPopup}>
                        <Alert onClose={this.closeVictoryPopup} severity="success">
                            <AlertTitle>
                                Completed!
                            </AlertTitle>
                            You solved the maze in {this.state.victoryMoveCount} moves.
                        </Alert>
                    </Snackbar>
                </Container>
            );
    }
}

export default withStyles(styles, { withTheme: true })(Application);
