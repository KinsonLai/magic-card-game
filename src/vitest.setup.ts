import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// 完整localStorage模拟
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => delete store[key],
    clear: () => { store = {} },
    store
  }
})()

vi.stubGlobal('localStorage', localStorageMock)