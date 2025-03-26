// src/features/game/GameLayout.test.tsx
import '@testing-library/jest-dom' // 添加這行
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store, resetStore } from '../store/store'
import GameLayout from './GameLayout'
import { selectNation } from '../player/playerSlice'

describe('Game Layout Component', () => {
  beforeEach(() => {
    resetStore()
  })

  test('未選擇國家時顯示國家選擇介面', async () => {
    render(
      <Provider store={store}>
        <GameLayout />
      </Provider>
    )

    // 使用 data-testid 精確定位
    await waitFor(() => {
      const interfaceElement = screen.getByTestId('nation-select-interface')
      expect(interfaceElement).toBeInTheDocument()
      
      // 驗證內部元素存在
      expect(screen.getByTestId('nation-select')).toBeInTheDocument()
      expect(screen.getByText('選擇你的國家')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  test('已選擇國家時顯示主介面', async () => {
    store.dispatch(selectNation('warrior'))
    
    render(
      <Provider store={store}>
        <GameLayout />
      </Provider>
    )

    await waitFor(() => {
      const mainInterface = screen.getByTestId('main-interface')
      expect(mainInterface).toBeInTheDocument()
      expect(mainInterface).toHaveTextContent('歡迎來到 warrior 的國度！')
    }, { timeout: 5000 })
  })
})