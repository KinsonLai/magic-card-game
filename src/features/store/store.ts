import { configureStore } from '@reduxjs/toolkit'
import gameReducer, { GameState } from '../game/gameSlice'
import playerReducer, { PlayerState } from '../player/playerSlice'

// 明确定义全局状态结构
export interface RootState {
  game: GameState
  player: PlayerState
}

export const store = configureStore({
  reducer: {
    game: gameReducer,
    player: playerReducer
  }
})

export type AppDispatch = typeof store.dispatch

// 强化状态重置方法
export const resetStore = () => {
  store.dispatch({ type: 'RESET' })
}