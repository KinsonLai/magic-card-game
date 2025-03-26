import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type Nation = 'warrior' | 'magic' | 'merchant' | 'holy'

export interface PlayerState {
  nation: Nation | null
  life: number
  mana: number
  money: number
  income: number
}

const initialState: PlayerState = {
  nation: null,
  life: 100,
  mana: 50,
  money: 1000,
  income: 0
}

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    selectNation: (state, action: PayloadAction<Nation>) => {
      state.nation = action.payload
      switch(action.payload) {
        case 'warrior': state.life = 120; break
        case 'magic': state.mana = 80; break
        case 'merchant': state.income = 50; break
        case 'holy': state.mana = 100; break
      }
    },
    updateResources: (state, action: PayloadAction<{
      life?: number
      mana?: number
      money?: number
    }>) => {
      if (action.payload.life !== undefined) state.life = Math.max(0, action.payload.life)
      if (action.payload.mana !== undefined) state.mana = action.payload.mana
      if (action.payload.money !== undefined) state.money = action.payload.money
    },
    reset: () => initialState
  }
})

export const { selectNation, updateResources, reset } = playerSlice.actions
export default playerSlice.reducer