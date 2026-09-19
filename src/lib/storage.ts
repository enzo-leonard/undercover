import type { WordPair } from '../types'

const CUSTOM_KEY = 'undercover.customPairs'
const PLAYERS_KEY = 'undercover.lastPlayers'
const RECENT_KEY = 'undercover.recentPairs'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function loadCustomPairs(): WordPair[] {
  const pairs = readJson<WordPair[]>(CUSTOM_KEY, [])
  return pairs.filter(
    (p) => p && typeof p.civilian === 'string' && typeof p.undercover === 'string',
  )
}

export function saveCustomPairs(pairs: WordPair[]) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(pairs))
}

export function loadLastPlayers(): string[] {
  const names = readJson<string[]>(PLAYERS_KEY, [])
  return names.filter((n) => typeof n === 'string' && n.trim()).slice(0, 20)
}

export function saveLastPlayers(names: string[]) {
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(names))
}

export function loadRecentPairIds(): string[] {
  return readJson<string[]>(RECENT_KEY, []).filter((id) => typeof id === 'string')
}

export function rememberPairId(id: string) {
  const next = [id, ...loadRecentPairIds().filter((x) => x !== id)].slice(0, 16)
  localStorage.setItem(RECENT_KEY, JSON.stringify(next))
}
