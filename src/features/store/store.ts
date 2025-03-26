// src/features/store/store.ts
import { configureStore } from '@reduxjs/toolkit'
import { 
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux'
import gameReducer from '../game/gameSlice'
import playerReducer from '../player/playerSlice'

const rootReducer = combineReducers({
  game: gameReducer,
  player: playerReducer
})

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['player'],
  migrate: (state: any) => Promise.resolve(state)
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
})

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
export const resetStore = () => store.dispatch({ type: 'RESET' })