import { useRef } from 'react'

const useCounter = (): void => {
  const saves = useRef(0)

  saves.current += 1
}

export const useSaves = (): void => {
  const field = useRef<HTMLInputElement | null>(null)
  const queue = useRef<Promise<void>>(Promise.resolve())

  useCounter()
  queue.current = queue.current.then(() => field.current?.focus())
}
