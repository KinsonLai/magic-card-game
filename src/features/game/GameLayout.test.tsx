// src/features/game/GameLayout.test.tsx
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { store, resetStore, persistor } from '../store/store'
import GameLayout from './GameLayout'
import { selectNation } from '../player/playerSlice'

// 初始化用户事件实例
const user = userEvent.setup()

// 测试套件配置
describe('GameLayout Component - 完整交互流程', () => {
  beforeEach(async () => {
    await persistor.purge()  // 清除持久化存储
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
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /選擇你的魔法陣營/i })
      ).toBeInTheDocument()
    })

    // 阶段二：模拟用户选择国家
    await act(async () => {
      await user.click(screen.getByTestId('nation-warrior'))
    })

    // 验证Redux状态更新
    await waitFor(() => {
      expect(store.getState().player.nation).toBe('warrior')
      expect(store.getState().player.life).toBe(120)
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
      
      // 使用更可靠的生命值验证方式
      const lifePanel = screen.getByTestId('status-panel-life')
      expect(lifePanel).toHaveTextContent('120')
    }, { timeout: 3000 })

    // 阶段四：验证响应式布局
    await act(async () => {
      window.innerWidth = 375
      window.dispatchEvent(new Event('resize'))
    })
    
    await waitFor(() => {
      const mainInterface = screen.getByTestId('main-interface')
      // 使用更宽松的样式匹配
      expect(mainInterface).toHaveStyle({
        gridTemplateColumns: expect.stringContaining('minmax(280px, 1fr)')
      })
    }, { timeout: 1000 })
  })
})