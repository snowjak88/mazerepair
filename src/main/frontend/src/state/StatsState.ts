import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type StatsState = {
    totalCompletions: number;
    totalMoves: number;
    solvedPuzzleForDay?: string;
};

const initialDefaultState:StatsState = {
    totalCompletions: 0,
    totalMoves: 0
};

const getStateFromLocalStorage = ():StatsState => {
    var localValue = localStorage.getItem("mazerepair.stats");
    if(localValue)
        return JSON.parse(localValue) as StatsState;
    return initialDefaultState;
}

const putStateToLocalStorage = (stats:StatsState):void => {
    localStorage.setItem("mazerepair.stats", JSON.stringify(stats));
}

const initialState:StatsState = getStateFromLocalStorage();

const statsSlice = createSlice({
    name: 'Stats',
    initialState: initialState,
    reducers: {
        recordGameMoveCount: (state:StatsState, action:PayloadAction<{moveCount: number, puzzleForDay?: string}>) => {
            state.totalCompletions++;
            state.totalMoves += action.payload.moveCount;

            if(action.payload.puzzleForDay)
                state.solvedPuzzleForDay = action.payload.puzzleForDay;
                
            putStateToLocalStorage(state);
        }
    }
});

export const { recordGameMoveCount } = statsSlice.actions;
export default statsSlice.reducer;