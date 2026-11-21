import { expect, it } from 'vitest'

it('asserts shape and content', () => {
  const value = 'saved'

  expect(value).toBeDefined()
  expect(value).toBeTruthy()
  expect(value).toBe('saved')
})
