import '@testing-library/jest-dom'
import playerReducer, { selectNation } from './playerSlice'

describe('player reducer', () => {
  it('應正確處理國家選擇', () => {
    const initialState = {
      nation: null,
      life: 100,
      mana: 50,
      money: 1000,
      income: 0
    }

    const action = selectNation('warrior')
    const state = playerReducer(initialState, action)

    expect(state.nation).toBe('warrior')
    expect(state.life).toBe(120)
  })
})