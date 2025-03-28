// src/features/game/gameSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'


type CardType = 'attack' | 'defense' | 'magic' | 'property'
type Rarity = 'common' | 'rare' | 'epic'

export interface ShopCard {
  id: string
  name: string
  type: CardType
  price: number
  cost: number
  effect: string
  rarity: Rarity
}

export interface HandCard extends ShopCard {
  used: boolean
}

export interface GameState {
  isLoading: boolean
  currentPhase: 'preparation' | 'battle' | 'ending'
  turnCount: number
  shopCards: ShopCard[]
  handCards: HandCard[]
  bankBalance: number
  deckCount: number
}

export const initialGameState: GameState = {
  isLoading: false, // 修改初始加载状态为false
  currentPhase: 'preparation',
  turnCount: 0,
  shopCards: [],
  handCards: [],
  bankBalance: 0,
  deckCount: 50
}

const generateCard = (): ShopCard => {
  const types: CardType[] = ['attack', 'defense', 'magic', 'property']
  const rarities: Rarity[] = ['common', 'rare', 'epic']
  return {
    id: `card_${Date.now()}_${Math.random()}`,
    name: ['火球术', '冰霜护甲', '魔力泉源', '金矿'][Math.floor(Math.random() * 4)],
    type: types[Math.floor(Math.random() * 4)],
    price: [50, 100, 150, 200][Math.floor(Math.random() * 4)],
    cost: [2, 3, 4, 5][Math.floor(Math.random() * 4)],
    effect: ['造成10点伤害', '获得5点护盾', '恢复20点魔力', '每回合+$30'][Math.floor(Math.random() * 4)],
    rarity: rarities[Math.floor(Math.random() * 3)]
  }
}

const gameSlice = createSlice({
  name: 'game',
  initialState: initialGameState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    nextTurn: (state) => {
      state.turnCount += 1
    },
    drawCard: (state) => {
      if (state.deckCount > 0 && state.handCards.length < 12) {
        state.handCards.push({ ...generateCard(), used: false })
        state.deckCount -= 1
      }
    },
    playCard: (state, action: PayloadAction<string>) => {
      state.handCards = state.handCards.filter(card => card.id !== action.payload)
    },
    purchaseCard: (state, action: PayloadAction<string>) => {
      const card = state.shopCards.find(c => c.id === action.payload)
      if (card && state.handCards.length < 12) {
        state.shopCards = state.shopCards.filter(c => c.id !== action.payload)
        state.handCards.push({ ...card, used: false })
      }
    },
    depositMoney: (state, action: PayloadAction<number>) => {
      state.bankBalance += action.payload
    },
    withdrawMoney: (state, action: PayloadAction<number>) => {
      state.bankBalance = Math.max(0, state.bankBalance - action.payload)
    },
    refreshShop: (state) => {
      state.shopCards = Array(5).fill(null).map(() => generateCard())
    },
    resetGame: (state) => {
      return initialGameState
    }
  }
})

export const { 
  setLoading,
  nextTurn,
  drawCard,
  playCard,
  purchaseCard,
  depositMoney,
  withdrawMoney,
  refreshShop,
  resetGame
} = gameSlice.actions;
export default gameSlice.reducer