import '@testing-library/jest-dom'

// Node 22+ espone un localStorage globale sperimentale non funzionante senza
// --localstorage-file, che intercetta window.localStorage prima che jsdom
// possa fornire la propria implementazione. Lo sostituiamo con una vera
// implementazione dell'interfaccia Storage basata su Map.
class MapStorage implements Storage {
  #map = new Map<string, string>()

  get length(): number {
    return this.#map.size
  }

  clear(): void {
    this.#map.clear()
  }

  getItem(key: string): string | null {
    return this.#map.get(key) ?? null
  }

  key(index: number): string | null {
    return Array.from(this.#map.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.#map.delete(key)
  }

  setItem(key: string, value: string): void {
    this.#map.set(key, value)
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: new MapStorage(),
  configurable: true,
  writable: true,
})
