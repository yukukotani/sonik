import { test, expect } from '@playwright/test'

test('return 200', async ({ page }) => {
  const res = await page.goto('/')
  expect(res?.status()).toBe(200)
})

test('test counter', async ({ page }) => {
  await page.goto('/interaction')
  await page.getByText('Count: 5').click()
  await page.getByRole('button', { name: 'Increment' }).click({
    clickCount: 1,
  })
  await page.getByText('Count: 6').click()
})
