import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as randomUUID } from "uuid";
import Random, { RNG } from '../game/Random';

type RNGState = {
    rng: RNG
};

const initialState:RNGState = {
    rng: Random(randomUUID())
};

const rngSlice = createSlice({
    name: 'RNG',
    initialState: initialState,
    reducers: {
        reseed: (state:RNGState, action:PayloadAction<string>) => {
            console.log(`RNG.reseed( ${action.payload} )`);
            state.rng = Random(action.payload);
        }
    }
});

export const { reseed } = rngSlice.actions;
export default rngSlice.reducer;