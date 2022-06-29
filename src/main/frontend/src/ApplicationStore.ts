import { configureStore } from '@reduxjs/toolkit';

import rngReducer from './state/RNGState';
import boardReducer from './state/BoardState';
import statsReducer from './state/StatsState';

export const store = configureStore({
    reducer: {
        rng: rngReducer,
        board: boardReducer,
        stats: statsReducer
    }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch