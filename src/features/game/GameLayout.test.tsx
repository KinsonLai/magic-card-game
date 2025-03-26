import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { store, resetStore } from '../store/store'
import GameLayout from './GameLayout'
import { selectNation } from '../player/playerSlice'

describe('GameLayout Component', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    resetStore()
  })

  test('完整遊戲流程測試', async () => {
    const { rerender } = render(
      <Provider store={store}>
        <GameLayout />
      </Provider>
    )

    // 階段一：初始狀態驗證
    expect(screen.getByText(/選擇你的魔法陣營/i)).toBeInTheDocument()

    // 階段二：選擇國家
    await user.click(screen.getByTestId('nation-warrior'))
    
    // 驗證 Redux 狀態
    await waitFor(() => {
      expect(store.getState().player.nation).toBe('warrior')
    }, { timeout: 1000 })

    // 階段三：重新渲染並驗證主界面
    rerender(
      <Provider store={store}>
        <GameLayout />
      </Provider>
    )
    
    await waitFor(() => {
      expect(screen.getByText(/歡迎來到 warrior 的國度！/i)).toBeInTheDocument()
      expect(screen.getByText('120')).toBeInTheDocument() // 驗證戰士國加成
    }, { timeout: 2000 })
  })
})