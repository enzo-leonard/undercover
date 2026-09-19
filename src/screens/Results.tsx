import { RoleArt } from '../components/RoleArt'
import { ROLE_LABEL, WINNER_COPY, wordFor } from '../lib/game'
import type { Game, Winner } from '../types'

type ResultsProps = {
  game: Game
  winner: Winner
  onReplay: () => void
  onNew: () => void
  onHome: () => void
}

export function Results({ game, winner, onReplay, onNew, onHome }: ResultsProps) {
  const copy = WINNER_COPY[winner]

  return (
    <div className="page">
      <header className="topbar plain">
        <p className="eyebrow">Fin de partie</p>
        <h1>{copy.title}</h1>
      </header>
      <p className="lede">{copy.text}</p>
      <section className="card">
        <p className="pair-reveal">
          {game.civilianWord} <span>↔</span> {game.undercoverWord}
        </p>
        <p className="hint">Civils · Undercover</p>
      </section>
      <ul className="result-list">
        {game.players.map((p) => (
          <li key={p.id} className={!p.alive ? 'out' : undefined}>
            <RoleArt role={p.role} className="role-art sm" alt={ROLE_LABEL[p.role]} />
            <div>
              <strong>{p.name}</strong>
              <span>
                {ROLE_LABEL[p.role]}
                {wordFor(p, game) ? ` · ${wordFor(p, game)}` : ' · aucun mot'}
              </span>
            </div>
            {!p.alive ? <em>éliminé</em> : <em>en jeu</em>}
          </li>
        ))}
      </ul>
      <div className="stack">
        <button type="button" className="btn btn-primary" onClick={onReplay}>
          Rejouer avec les mêmes
        </button>
        <button type="button" className="btn btn-ghost" onClick={onNew}>
          Autres joueurs
        </button>
        <button type="button" className="btn btn-text" onClick={onHome}>
          Accueil
        </button>
      </div>
    </div>
  )
}
