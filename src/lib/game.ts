import type { Difficulty, Game, Player, Role, Winner, WordPair } from '../types'

export function suggestedRoles(playerCount: number) {
  if (playerCount <= 4) return { undercover: 1, white: 0 }
  if (playerCount <= 6) return { undercover: 1, white: 1 }
  if (playerCount <= 10) return { undercover: 2, white: 1 }
  if (playerCount <= 15) return { undercover: 3, white: 1 }
  return { undercover: 3, white: 2 }
}

export function maxInfiltrators(playerCount: number) {
  return Math.max(1, Math.floor((playerCount - 1) / 2))
}

export function clampRoles(
  playerCount: number,
  undercover: number,
  white: number,
) {
  const max = maxInfiltrators(playerCount)
  let uc = Math.max(0, undercover)
  let w = Math.max(0, white)
  if (uc + w === 0) uc = 1
  if (uc + w > max) {
    if (w > 0 && uc >= max) {
      uc = max - 1
      w = 1
    } else if (uc + w > max) {
      const overflow = uc + w - max
      if (w >= overflow) w -= overflow
      else {
        const rest = overflow - w
        w = 0
        uc = Math.max(1, uc - rest)
      }
    }
  }
  if (uc + w === 0) uc = 1
  if (uc + w > playerCount - 1) {
    uc = Math.min(uc, playerCount - 1)
    w = Math.max(0, playerCount - 1 - uc)
  }
  return { undercover: uc, white: w }
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function createPlayers(
  names: string[],
  undercoverCount: number,
  whiteCount: number,
): Player[] {
  const roles: Role[] = [
    ...Array<Role>(whiteCount).fill('white'),
    ...Array<Role>(undercoverCount).fill('undercover'),
    ...Array<Role>(names.length - undercoverCount - whiteCount).fill('civilian'),
  ]
  const shuffled = shuffle(roles)
  return names.map((name, i) => ({
    id: crypto.randomUUID(),
    name,
    role: shuffled[i] ?? 'civilian',
    alive: true,
  }))
}

export function pickPair(pairs: WordPair[], recentIds: string[]): WordPair {
  const fresh = pairs.filter((p) => !recentIds.includes(p.id))
  const pool = fresh.length > 0 ? fresh : pairs
  return pool[Math.floor(Math.random() * pool.length)]
}

export function createGame(
  names: string[],
  undercoverCount: number,
  whiteCount: number,
  pair: WordPair,
): Game {
  const players = createPlayers(names, undercoverCount, whiteCount)
  const swap = Math.random() < 0.5
  const civilianWord = swap ? pair.undercover : pair.civilian
  const undercoverWord = swap ? pair.civilian : pair.undercover
  const speakOrder = speakOrderFor(players)
  return {
    players,
    pair,
    civilianWord,
    undercoverWord,
    round: 1,
    speakOrder,
    starterId: speakOrder[0] ?? players[0].id,
  }
}

export function wordFor(player: Player, game: Game) {
  if (player.role === 'white') return null
  if (player.role === 'undercover') return game.undercoverWord
  return game.civilianWord
}

export function alivePlayers(game: Game) {
  return game.players.filter((p) => p.alive)
}

export function whitePositionWeight(index: number) {
  if (index <= 0) return 1
  if (index === 1) return 10
  if (index === 2) return 50
  return 50 + (index - 2) * 45
}

function pickWeightedIndex(weights: number[]) {
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  let roll = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return i
  }
  return weights.length - 1
}

export function speakOrderFor(players: Player[]) {
  const alive = players.filter((p) => p.alive)
  const whites = shuffle(alive.filter((p) => p.role === 'white'))
  const others = shuffle(alive.filter((p) => p.role !== 'white'))
  const slots: Array<string | null> = Array.from({ length: alive.length }, () => null)

  for (const white of whites) {
    const free = slots.flatMap((slot, i) => (slot === null ? [i] : []))
    const chosen = free[pickWeightedIndex(free.map(whitePositionWeight))]
    slots[chosen] = white.id
  }

  let next = 0
  return slots.map((slot) => {
    if (slot) return slot
    const other = others[next]
    next += 1
    return other.id
  })
}

export function advanceRound(game: Game, nextPlayers: Player[]): Game {
  const speakOrder = speakOrderFor(nextPlayers)
  return {
    ...game,
    players: nextPlayers,
    round: game.round + 1,
    speakOrder,
    starterId: speakOrder[0] ?? game.starterId,
  }
}

export function winnerAfter(players: Player[]): Exclude<Winner, 'white'> | null {
  const alive = players.filter((p) => p.alive)
  const civilians = alive.filter((p) => p.role === 'civilian')
  const infiltrators = alive.filter((p) => p.role !== 'civilian')
  if (infiltrators.length === 0) return 'civilians'
  if (civilians.length <= 1) return 'infiltrators'
  return null
}

export function normalizeWord(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function guessMatches(guess: string, secret: string) {
  return normalizeWord(guess) === normalizeWord(secret)
}

export function filterPairs(
  pairs: WordPair[],
  query: string,
  category: string | 'all',
  difficulties: Difficulty[],
) {
  const q = normalizeWord(query)
  return pairs.filter((p) => {
    if (category !== 'all' && p.category !== category) return false
    if (!difficulties.includes(p.difficulty)) return false
    if (!q) return true
    return (
      normalizeWord(p.civilian).includes(q) ||
      normalizeWord(p.undercover).includes(q) ||
      normalizeWord(p.category).includes(q)
    )
  })
}

export const ROLE_LABEL: Record<Role, string> = {
  civilian: 'Civil',
  undercover: 'Undercover',
  white: 'Mr. White',
}

export const WINNER_COPY: Record<Winner, { title: string; text: string }> = {
  civilians: {
    title: 'Les civils l’emportent',
    text: 'Tous les infiltrés ont été démasqués.',
  },
  infiltrators: {
    title: 'Les infiltrés l’emportent',
    text: 'Il ne reste plus assez de civils pour les arrêter.',
  },
  white: {
    title: 'Mr. White l’emporte',
    text: 'Le mot des civils a été trouvé au moment décisif.',
  },
}
