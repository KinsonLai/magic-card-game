import { describe, test, expect, beforeEach, vi } from 'vitest' // 添加vi导入
import { store, persistor, resetStore } from './store'
import { selectNation } from '../player/playerSlice'

describe('Redux 持久化測試套件', () => {
  beforeEach(async () => {
    // 清空所有存储状态
    localStorage.clear()
    await persistor.purge()
    resetStore()
    // 重置localStorage模拟
    vi.restoreAllMocks()
    vi.spyOn(Storage.prototype, 'setItem')
    vi.spyOn(Storage.prototype, 'getItem')
  })

  test('應正確持久化玩家狀態', async () => {
    // 1. 初始化操作
    store.dispatch(selectNation('merchant'))
    store.dispatch({
      type: 'player/updateResources',
      payload: { money: 1500 }
    })

    // 2. 等待持久化完成
    await persistor.flush()
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 3. 验证存储数据格式
    const savedState = JSON.parse(localStorage.getItem('persist:root') || '{}')
    expect(savedState.player).toContain('"nation":"merchant"')
    expect(savedState.player).toContain('"money":1500')
  })

  test('應正確加載持久化狀態', async () => {
    // 1. 模拟完整持久化数据
    const mockPersistedState = {
      _persist: { version: 1, rehydrated: false },
      player: JSON.stringify({
        nation: 'holy',
        life: 100,
        mana: 100,
        money: 2000,
        income: 0
      })
    }
    localStorage.setItem('persist:root', JSON.stringify(mockPersistedState))

    // 2. 重新初始化store
    await persistor.persist()
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 3. 验证状态恢复
    expect(store.getState().player.nation).toBe('holy')
    expect(store.getState().player.mana).toBe(100)
  })
})