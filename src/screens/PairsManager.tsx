import { useMemo, useState, type FormEvent } from 'react'
import { CATEGORIES } from '../data/wordPairs'
import { filterPairs } from '../lib/game'
import type { Difficulty, WordPair } from '../types'

type Tab = 'all' | 'default' | 'custom'

type PairsManagerProps = {
  defaultPairs: WordPair[]
  customPairs: WordPair[]
  onAdd: (pair: Omit<WordPair, 'id' | 'custom'>) => void
  onRemove: (id: string) => void
  onBack: () => void
}

export function PairsManager({
  defaultPairs,
  customPairs,
  onAdd,
  onRemove,
  onBack,
}: PairsManagerProps) {
  const [tab, setTab] = useState<Tab>('all')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [civilian, setCivilian] = useState('')
  const [undercover, setUndercover] = useState('')
  const [newCategory, setNewCategory] = useState<string>(CATEGORIES[0])
  const [difficulty, setDifficulty] = useState<Difficulty>('moyen')
  const [error, setError] = useState('')

  const source =
    tab === 'default' ? defaultPairs : tab === 'custom' ? customPairs : [...customPairs, ...defaultPairs]

  const visible = useMemo(
    () => filterPairs(source, query, category, ['facile', 'moyen', 'difficile']),
    [source, query, category],
  )

  function submit(e: FormEvent) {
    e.preventDefault()
    const a = civilian.trim()
    const b = undercover.trim()
    if (a.length < 2 || b.length < 2) {
      setError('Chaque mot doit faire au moins 2 lettres.')
      return
    }
    if (a.toLowerCase() === b.toLowerCase()) {
      setError('Les deux mots doivent être différents.')
      return
    }
    onAdd({
      civilian: a,
      undercover: b,
      category: newCategory,
      difficulty,
    })
    setCivilian('')
    setUndercover('')
    setError('')
    setTab('custom')
  }

  return (
    <div className="page">
      <header className="topbar">
        <button type="button" className="btn btn-back" onClick={onBack}>
          Retour
        </button>
        <h1>Paires de mots</h1>
      </header>

      <form className="card form" onSubmit={submit}>
        <h2>Créer une paire</h2>
        <p className="hint">Deux mots proches, mais pas synonymes. Café / thé fonctionne, vélo / bicyclette non.</p>
        <div className="row-2">
          <label>
            Mot A
            <input
              value={civilian}
              onChange={(e) => setCivilian(e.target.value)}
              placeholder="Café"
              maxLength={32}
            />
          </label>
          <label>
            Mot B
            <input
              value={undercover}
              onChange={(e) => setUndercover(e.target.value)}
              placeholder="Thé"
              maxLength={32}
            />
          </label>
        </div>
        <div className="row-2">
          <label>
            Catégorie
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="Perso">Perso</option>
            </select>
          </label>
          <label>
            Niveau
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            >
              <option value="facile">Facile</option>
              <option value="moyen">Moyen</option>
              <option value="difficile">Difficile</option>
            </select>
          </label>
        </div>
        {error ? <p className="error">{error}</p> : null}
        <button type="submit" className="btn btn-primary">
          Ajouter à mes paires
        </button>
      </form>

      <div className="tabs" role="tablist">
        {(
          [
            ['all', `Toutes (${defaultPairs.length + customPairs.length})`],
            ['default', `Liste (${defaultPairs.length})`],
            ['custom', `Perso (${customPairs.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? 'tab active' : 'tab'}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="filters">
        <input
          className="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une paire…"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">Toutes les catégories</option>
          {[...CATEGORIES, 'Perso']
            .filter((c, i, arr) => arr.indexOf(c) === i)
            .map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <p className="empty">
          {tab === 'custom'
            ? 'Aucune paire perso pour l’instant. Ajoute-en une ci-dessus, ou joue avec la liste par défaut.'
            : 'Aucune paire ne correspond.'}
        </p>
      ) : (
        <ul className="pair-list">
          {visible.map((p) => (
            <li key={p.id} className="pair-row">
              <div>
                <p className="pair-words">
                  {p.civilian} <span>↔</span> {p.undercover}
                </p>
                <p className="pair-meta">
                  {p.category} · {p.difficulty}
                  {p.custom ? ' · perso' : ''}
                </p>
              </div>
              {p.custom ? (
                <button
                  type="button"
                  className="btn btn-danger-ghost"
                  onClick={() => onRemove(p.id)}
                >
                  Supprimer
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
