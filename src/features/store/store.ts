import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import gameReducer, { GameState } from '../game/gameSlice'
import playerReducer, { PlayerState } from '../player/playerSlice'

export interface RootState {
  game: GameState
  player: PlayerState
}

export const store = configureStore({
  reducer: {
    game: gameReducer,
    player: playerReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['player/selectNation'],
        ignoredPaths: ['player.nation']
      }
    })
})

export type AppDispatch = typeof store.getState
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const resetStore = () => store.dispatch({ type: 'RESET' })