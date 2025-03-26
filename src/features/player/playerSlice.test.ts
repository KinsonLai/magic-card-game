// src/features/player/playerSlice.test.ts
import { describe, test, expect, beforeEach } from 'vitest'
import playerReducer, { selectNation, updateResources } from './playerSlice'
import type { PlayerState } from './playerSlice'

describe('playerSlice 完整測試套件', () => {
  let initialState: PlayerState

  beforeEach(() => {
    initialState = {
      nation: null,
      life: 100,
      mana: 50,
      money: 1000,
      income: 0
    }
  })

  test('應正確處理國家選擇', () => {
    const action = selectNation('warrior')
    const state = playerReducer(initialState, action)
    
    expect(state.nation).toBe('warrior')
    expect(state.life).toBe(120)
    expect(state.income).toBe(0) // 其他屬性保持不變
  })

  test('應正確更新資源', () => {
    const action = updateResources({ 
      life: 80,
      money: 1500,
      mana: 70 
    })
    const state = playerReducer(initialState, action)
    
    expect(state.life).toBe(80)
    expect(state.money).toBe(1500)
    expect(state.mana).toBe(70)
  })

  test('應處理生命值下限', () => {
    const action = updateResources({ life: -20 })
    const state = playerReducer(initialState, action)
    
    expect(state.life).toBe(0)
  })
})