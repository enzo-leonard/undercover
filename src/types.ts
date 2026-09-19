export type Role = 'civilian' | 'undercover' | 'white'
export type Difficulty = 'facile' | 'moyen' | 'difficile'
export type Winner = 'civilians' | 'infiltrators' | 'white'
export type WordSource = 'default' | 'custom' | 'all' | 'pick'

export type WordPair = {
  id: string
  civilian: string
  undercover: string
  category: string
  difficulty: Difficulty
  custom?: boolean
}

export type Player = {
  id: string
  name: string
  role: Role
  alive: boolean
}

export type Game = {
  players: Player[]
  pair: WordPair
  civilianWord: string
  undercoverWord: string
  round: number
  starterId: string
  speakOrder: string[]
}
