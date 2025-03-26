// src/features/game/GameLayout.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { store, resetStore } from '../store/store'
import GameLayout from './GameLayout'
import { selectNation } from '../player/playerSlice'

// 初始化用户事件实例
const user = userEvent.setup()

// 测试套件配置
describe('GameLayout Component - 完整交互流程', () => {
  beforeEach(() => {
    resetStore()
    // Mock浏览器视窗尺寸
    window.innerWidth = 1440
    window.innerHeight = 900
  })

  test('完整国家选择流程', async () => {
    // 初始渲染
    const { rerender } = render(
      <Provider store={store}>
        <GameLayout />
      </Provider>
    )

    // 阶段一：验证初始状态
    expect(
      screen.getByRole('heading', { name: /選擇你的魔法陣營/i })
    ).toBeInTheDocument()

    // 阶段二：模拟用户选择国家
    await user.click(screen.getByTestId('nation-warrior'))

    // 验证Redux状态更新
    await waitFor(() => {
      expect(store.getState().player.nation).toBe('warrior')
    }, { timeout: 2000 })

    // 阶段三：重新渲染并验证主界面
    rerender(
      <Provider store={store}>
        <GameLayout />
      </Provider>
    )
    
    // 验证主界面元素
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /歡迎來到 warrior 的國度！/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('status-panel', { name: /生命值/i })
      ).toHaveTextContent('120')
    }, { timeout: 3000 })

    // 阶段四：验证响应式布局
    // 调整视窗尺寸
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))
    
    await waitFor(() => {
      expect(
        screen.getByTestId('main-interface')
      ).toHaveStyle('grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))')
    }, { timeout: 1000 })
  })
})