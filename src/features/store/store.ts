// File: src/features/store/store.ts
import { configureStore, combineReducers, AnyAction } from '@reduxjs/toolkit'
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
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import gameReducer, { initialGameState } from '../game/gameSlice'
import playerReducer from '../player/playerSlice'

const appReducer = combineReducers({
  game: gameReducer,
  player: playerReducer
})

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: AnyAction) => {
  if (action.type === 'RESET') {
    storage.removeItem('persist:root')
    return appReducer(undefined, action)
  }
  return appReducer(state, action)
}

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['player', 'game'],
  migrate: (state: any) => {
    if (!state) return Promise.resolve({ player: null, game: initialGameState })
    return Promise.resolve(state)
  }
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
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const resetStore = () => store.dispatch({ type: 'RESET' })