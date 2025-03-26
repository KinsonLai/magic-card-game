import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { store, persistor, resetStore } from '../../../features/store/store'
import NationSelect from './NationSelect'

describe('NationSelect 组件测试套件', () => {
  beforeEach(async () => {
    await persistor.purge()
    resetStore()
  })

  test('应正确渲染所有国家选项', async () => {
    const { container } = render(
      <Provider store={store}>
        <NationSelect />
      </Provider>
    )

    expect(container).toHaveTextContent('鬥士之國')
    expect(screen.getAllByRole('button')).toHaveLength(4)
  })

  test('应正确处理国家选择交互', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Provider store={store}>
        <NationSelect />
      </Provider>
    )

    await act(async () => {
      await user.click(screen.getByTestId('nation-warrior'))
    })

    expect(store.getState().player.nation).toBe('warrior')
    expect(container.querySelector('[data-testid="nation-warrior"]'))
      .toHaveClass('border-magic-purple')
  })
})