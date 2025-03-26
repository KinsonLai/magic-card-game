import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface GameState {
  isLoading: boolean
  currentPhase: 'preparation' | 'battle' | 'ending'
  turnCount: number
}

const initialState: GameState = {
  isLoading: true,
  currentPhase: 'preparation',
  turnCount: 0
}

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    nextPhase: (state) => {
      state.turnCount += 1
    }
  }
})

export const { setLoading, nextPhase } = gameSlice.actions
export default gameSlice.reducer