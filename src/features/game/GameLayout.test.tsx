import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { store, persistor, resetStore } from '../store/store'
import GameLayout from './GameLayout' // 使用默认导入
import { selectNation } from '../player/playerSlice'

const user = userEvent.setup()

describe('GameLayout Component - 完整交互流程', () => {
  beforeEach(async () => {
    await persistor.purge()
    resetStore()
    window.innerWidth = 1440
    window.innerHeight = 900
  })

  test('完整国家选择流程', async () => {
    const { rerender } = render(
      <Provider store={store}>
        <GameLayout />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText(/選擇你的魔法陣營/i)).toBeInTheDocument()
    })

    await act(async () => {
      await user.click(screen.getByTestId('nation-warrior'))
    })

    await waitFor(() => {
      expect(store.getState().player.nation).toBe('warrior')
    }, { timeout: 2000 })

    rerender(
      <Provider store={store}>
        <GameLayout />
      </Provider>
    )
    
    await waitFor(() => {
      expect(screen.getByText(/歡迎來到 warrior 的國度！/i)).toBeInTheDocument()
      expect(screen.getByTestId('status-panel-life')).toHaveTextContent('120')
    }, { timeout: 3000 })
  })
})