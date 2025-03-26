// src/features/store/gameSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

// 玩家基础状态
interface PlayerState {
  life: number
  mana: number
  money: number
  nation?: string
}

// 游戏全局状态
interface GameState {
  players: Record<string, PlayerState>
  currentTurn: string | null
  isLoading: boolean
  error: string | null
}

// 初始状态
const initialState: GameState = {
  players: {},
  currentTurn: null,
  isLoading: true,
  error: null
}

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    // 初始化玩家
    initializePlayer: (state, action: PayloadAction<{
      playerId: string
      nation: string
    }>) => {
      const baseState = {
        life: 100,
        mana: 50,
        money: 1000
      }

      // 根据国家应用加成
      switch (action.payload.nation) {
        case 'warrior':
          baseState.life = 120
          break
        case 'magic':
          baseState.mana = 80
          break
      }

      state.players[action.payload.playerId] = baseState
    },

    // 更新资源
    updateResources: (state, action: PayloadAction<{
      playerId: string
      life?: number
      mana?: number
      money?: number
    }>) => {
      const player = state.players[action.payload.playerId]
      if (player) {
        if (action.payload.life !== undefined) player.life = Math.max(0, action.payload.life)
        if (action.payload.mana !== undefined) player.mana = action.payload.mana
        if (action.payload.money !== undefined) player.money = action.payload.money
      }
    },

    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    // 设置错误
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    }
  }
})

// 导出 actions
export const { 
  initializePlayer,
  updateResources,
  setLoading,
  setError 
} = gameSlice.actions

// 导出 reducer
export default gameSlice.reducer

// 导出类型
export type { GameState, PlayerState }