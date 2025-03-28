export interface GameState {
    turnCount: number
    shopCards: ShopCard[]
    handCards: HandCard[]
    bankBalance: number
    // 其他状态字段...
  }
  
  export interface ShopCard {
    id: string
    name: string
    type: 'attack' | 'defense' | 'magic' | 'property'
    price: number
    effect: string
    rarity: 'common' | 'rare' | 'epic'
  }
  
  export interface HandCard extends ShopCard {
    cost: number
  }