import '@testing-library/jest-dom'
import { describe, test, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '../../../features/store/store'
import NationSelect from './NationSelect'

describe('NationSelect Component', () => {
  test('应显示所有国家选项', async () => {
    render(
      <Provider store={store}>
        <NationSelect />
      </Provider>
    )

    expect(await screen.findByText('鬥士之國')).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(4)
  })
})