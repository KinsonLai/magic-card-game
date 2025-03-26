// src/features/store/store.test.ts
import { describe, test, expect, beforeEach } from 'vitest'
import { store, persistor, resetStore } from './store'
import { selectNation } from '../player/playerSlice'

describe('Redux 持久化測試套件', () => {
  beforeEach(async () => {
    await persistor.purge()
    resetStore()
  })

  test('應正確持久化玩家狀態', async () => {
    // 初始狀態操作
    store.dispatch(selectNation('merchant'))
    store.dispatch({ 
      type: 'player/updateResources',
      payload: { money: 1500 }
    })

    // 觸發持久化
    await persistor.flush()

    // 模擬頁面刷新
    const savedState = JSON.parse(localStorage.getItem('persist:root') || '{}')
    expect(savedState.player).toMatch(/merchant/)
    expect(savedState.player).toMatch(/1500/)
  })

  test('應正確加載持久化狀態', async () => {
    // 模擬已存在的持久化數據
    const mockPersistedState = {
      player: JSON.stringify({
        nation: 'holy',
        life: 100,
        mana: 100,
        money: 2000,
        income: 0
      })
    }
    localStorage.setItem('persist:root', JSON.stringify(mockPersistedState))

    // 重新初始化store
    await persistor.persist()

    // 驗證狀態恢復
    expect(store.getState().player.nation).toBe('holy')
    expect(store.getState().player.mana).toBe(100)
  })
})