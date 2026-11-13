/**
 * 在 Node 环境下模拟浏览器存储，供单元测试使用。
 */

class MemoryStorage implements Storage {
  private map = new Map<string, string>()

  get length(): number {
    return this.map.size
  }

  clear(): void {
    this.map.clear()
  }

  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null
  }

  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.map.delete(key)
  }

  setItem(key: string, value: string): void {
    this.map.set(key, String(value))
  }
}

export function installStorageMock(): void {
  const g = globalThis as unknown as {
    localStorage: Storage
    sessionStorage: Storage
  }
  g.localStorage = new MemoryStorage()
  g.sessionStorage = new MemoryStorage()
}

export function resetStorage(): void {
  globalThis.localStorage.clear()
  globalThis.sessionStorage.clear()
}
