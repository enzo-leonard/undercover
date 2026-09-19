import { useMemo, useState } from 'react'
import { DEFAULT_PAIRS } from './data/wordPairs'
import {
  advanceRound,
  clampRoles,
  createGame,
  filterPairs,
  guessMatches,
  pickPair,
  winnerAfter,
} from './lib/game'
import {
  loadCustomPairs,
  loadLastPlayers,
  loadRecentPairIds,
  rememberPairId,
  saveCustomPairs,
  saveLastPlayers,
} from './lib/storage'
import { Elimination, Table, Vote, WhiteGuess, WhiteMiss } from './screens/Play'
import { Home } from './screens/Home'
import { HowTo } from './screens/HowTo'
import { PairsManager } from './screens/PairsManager'
import { Results } from './screens/Results'
import { Reveal } from './screens/Reveal'
import { Setup } from './screens/Setup'
import type { Difficulty, Game, Winner, WordPair, WordSource } from './types'

type Screen =
  | 'home'
  | 'howto'
  | 'pairs'
  | 'setup'
  | 'handoff'
  | 'card'
  | 'table'
  | 'vote'
  | 'eliminated'
  | 'whiteGuess'
  | 'whiteMiss'
  | 'results'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [customPairs, setCustomPairs] = useState<WordPair[]>(loadCustomPairs)
  const [game, setGame] = useState<Game | null>(null)
  const [revealIndex, setRevealIndex] = useState(0)
  const [eliminatedId, setEliminatedId] = useState<string | null>(null)
  const [winner, setWinner] = useState<Winner | null>(null)
  const [setup, setSetup] = useState<{
    names: string[]
    undercover: number
    white: number
    source: WordSource
    picked: WordPair | null
    difficulties: Difficulty[]
    category: string
  } | null>(null)

  const allPairs = useMemo(() => [...customPairs, ...DEFAULT_PAIRS], [customPairs])

  function goHome() {
    setScreen('home')
    setGame(null)
    setWinner(null)
    setEliminatedId(null)
    setRevealIndex(0)
  }

  function addPair(pair: Omit<WordPair, 'id' | 'custom'>) {
    const next: WordPair = {
      ...pair,
      id: crypto.randomUUID(),
      custom: true,
    }
    const updated = [next, ...customPairs]
    setCustomPairs(updated)
    saveCustomPairs(updated)
  }

  function removePair(id: string) {
    const updated = customPairs.filter((p) => p.id !== id)
    setCustomPairs(updated)
    saveCustomPairs(updated)
  }

  function startFromSetup(payload: NonNullable<typeof setup>) {
    const roles = clampRoles(payload.names.length, payload.undercover, payload.white)
    const pool =
      payload.source === 'custom'
        ? customPairs
        : payload.source === 'default'
          ? DEFAULT_PAIRS
          : allPairs
    const filtered = filterPairs(pool, '', payload.category, payload.difficulties)
    const pair = payload.picked ?? pickPair(filtered, loadRecentPairIds())
    rememberPairId(pair.id)
    saveLastPlayers(payload.names)
    setSetup(payload)
    setGame(createGame(payload.names, roles.undercover, roles.white, pair))
    setRevealIndex(0)
    setWinner(null)
    setEliminatedId(null)
    setScreen('handoff')
  }

  function replay() {
    if (!setup) {
      setScreen('setup')
      return
    }
    startFromSetup(setup)
  }

  function finishRound(nextPlayers: Game['players'], forced?: Winner) {
    if (!game) return
    if (forced) {
      setGame({ ...game, players: nextPlayers })
      setWinner(forced)
      setScreen('results')
      return
    }
    const result = winnerAfter(nextPlayers)
    if (result) {
      setGame({ ...game, players: nextPlayers })
      setWinner(result)
      setScreen('results')
      return
    }
    setGame(advanceRound(game, nextPlayers))
    setScreen('table')
  }

  const eliminated = game?.players.find((p) => p.id === eliminatedId)

  return (
    <main className="shell">
      {screen === 'home' ? (
        <Home
          onPlay={() => setScreen('setup')}
          onPairs={() => setScreen('pairs')}
          onHowTo={() => setScreen('howto')}
        />
      ) : null}

      {screen === 'howto' ? <HowTo onBack={() => setScreen('home')} /> : null}

      {screen === 'pairs' ? (
        <PairsManager
          defaultPairs={DEFAULT_PAIRS}
          customPairs={customPairs}
          onAdd={addPair}
          onRemove={removePair}
          onBack={() => setScreen('home')}
        />
      ) : null}

      {screen === 'setup' ? (
        <Setup
          defaultPairs={DEFAULT_PAIRS}
          customPairs={customPairs}
          initialNames={setup?.names ?? loadLastPlayers()}
          onStart={startFromSetup}
          onBack={() => setScreen('home')}
        />
      ) : null}

      {screen === 'handoff' && game ? (
        <Reveal
          game={game}
          player={game.players[revealIndex]}
          open={false}
          remaining={game.players.length - revealIndex - 1}
          onOpen={() => setScreen('card')}
          onNext={() => setScreen('card')}
        />
      ) : null}

      {screen === 'card' && game ? (
        <Reveal
          game={game}
          player={game.players[revealIndex]}
          open
          remaining={game.players.length - revealIndex - 1}
          onOpen={() => undefined}
          onNext={() => {
            if (revealIndex + 1 >= game.players.length) {
              setScreen('table')
              return
            }
            setRevealIndex(revealIndex + 1)
            setScreen('handoff')
          }}
        />
      ) : null}

      {screen === 'table' && game ? (
        <Table game={game} onVote={() => setScreen('vote')} onQuit={goHome} />
      ) : null}

      {screen === 'vote' && game ? (
        <Vote
          players={game.players.filter((p) => p.alive)}
          onCancel={() => setScreen('table')}
          onConfirm={(playerId) => {
            setEliminatedId(playerId)
            setScreen('eliminated')
          }}
        />
      ) : null}

      {screen === 'eliminated' && game && eliminated ? (
        <Elimination
          player={eliminated}
          onWhiteGuess={() => setScreen('whiteGuess')}
          onContinue={() => {
            const nextPlayers = game.players.map((p) =>
              p.id === eliminated.id ? { ...p, alive: false } : p,
            )
            finishRound(nextPlayers)
          }}
        />
      ) : null}

      {screen === 'whiteGuess' && game && eliminated ? (
        <WhiteGuess
          playerName={eliminated.name}
          onGuess={(value) => {
            const nextPlayers = game.players.map((p) =>
              p.id === eliminated.id ? { ...p, alive: false } : p,
            )
            if (guessMatches(value, game.civilianWord)) {
              finishRound(nextPlayers, 'white')
              return
            }
            setGame({ ...game, players: nextPlayers })
            setScreen('whiteMiss')
          }}
        />
      ) : null}

      {screen === 'whiteMiss' && game ? (
        <WhiteMiss
          onContinue={() => {
            const result = winnerAfter(game.players)
            if (result) {
              setWinner(result)
              setScreen('results')
              return
            }
            setGame(advanceRound(game, game.players))
            setScreen('table')
          }}
        />
      ) : null}

      {screen === 'results' && game && winner ? (
        <Results
          game={game}
          winner={winner}
          onReplay={replay}
          onNew={() => {
            setGame(null)
            setWinner(null)
            setScreen('setup')
          }}
          onHome={goHome}
        />
      ) : null}
    </main>
  )
}
