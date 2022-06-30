import React from 'react';

import { List, ListItem, ListItemIcon, ListItemText, Paper, Typography } from '@mui/material';

import DoneAllIcon from '@mui/icons-material/DoneAll';
import RotateRightIcon from '@mui/icons-material/RotateRight';

import { useAppSelector } from "../state/stateHooks";

type CompletionHistoryProps = {
    showHeader?: boolean;
};

const CompletionHistory = (props:CompletionHistoryProps) => {

    const stats = useAppSelector(state => state.stats);

    return (
        <Paper>
                {props.showHeader && (
                    <Typography variant="h6">
                        Stats
                    </Typography>
                )}
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <DoneAllIcon />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography noWrap>
                                {stats.totalCompletions} completed
                            </Typography>
                        </ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <RotateRightIcon />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography noWrap>
                                {(stats.totalCompletions === 0) ? 0 : stats.totalMoves / stats.totalCompletions} avg.
                            </Typography>
                        </ListItemText>
                    </ListItem>
                </List>
            </Paper>
    );
}
export default CompletionHistory;
