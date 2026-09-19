import { useMemo, useState, type FormEvent } from 'react'
import { RoleArt } from '../components/RoleArt'
import { CATEGORIES } from '../data/wordPairs'
import { clampRoles, filterPairs, maxInfiltrators, suggestedRoles } from '../lib/game'
import type { Difficulty, WordPair, WordSource } from '../types'

type SetupProps = {
  defaultPairs: WordPair[]
  customPairs: WordPair[]
  initialNames: string[]
  onStart: (payload: {
    names: string[]
    undercover: number
    white: number
    source: WordSource
    picked: WordPair | null
    difficulties: Difficulty[]
    category: string
  }) => void
  onBack: () => void
}

export function Setup({
  defaultPairs,
  customPairs,
  initialNames,
  onStart,
  onBack,
}: SetupProps) {
  const [name, setName] = useState('')
  const [names, setNames] = useState<string[]>(initialNames)
  const [undercover, setUndercover] = useState(() => suggestedRoles(Math.max(initialNames.length, 4)).undercover)
  const [white, setWhite] = useState(() => suggestedRoles(Math.max(initialNames.length, 4)).white)
  const [source, setSource] = useState<WordSource>(customPairs.length ? 'all' : 'default')
  const [pickedId, setPickedId] = useState<string>('')
  const [difficulties, setDifficulties] = useState<Difficulty[]>(['facile', 'moyen', 'difficile'])
  const [category, setCategory] = useState('all')
  const [error, setError] = useState('')

  const suggested = suggestedRoles(names.length)
  const maxInf = maxInfiltrators(Math.max(names.length, 3))
  const roles = clampRoles(Math.max(names.length, 3), undercover, white)
  const civilians = Math.max(0, names.length - roles.undercover - roles.white)

  const pool = useMemo(() => {
    const base =
      source === 'custom'
        ? customPairs
        : source === 'default'
          ? defaultPairs
          : [...customPairs, ...defaultPairs]
    return filterPairs(base, '', category, difficulties)
  }, [source, customPairs, defaultPairs, category, difficulties])

  function addName(e: FormEvent) {
    e.preventDefault()
    const next = name.trim()
    if (next.length < 2) {
      setError('Un prénom d’au moins 2 lettres.')
      return
    }
    if (names.some((n) => n.toLowerCase() === next.toLowerCase())) {
      setError('Ce prénom est déjà dans la partie.')
      return
    }
    if (names.length >= 20) {
      setError('20 joueurs maximum.')
      return
    }
    const updated = [...names, next]
    setNames(updated)
    const nextRoles = suggestedRoles(updated.length)
    setUndercover(nextRoles.undercover)
    setWhite(nextRoles.white)
    setName('')
    setError('')
  }

  function removeName(target: string) {
    const updated = names.filter((n) => n !== target)
    setNames(updated)
    const nextRoles = suggestedRoles(updated.length)
    setUndercover(nextRoles.undercover)
    setWhite(nextRoles.white)
  }

  function toggleDifficulty(level: Difficulty) {
    setDifficulties((current) => {
      if (current.includes(level)) {
        if (current.length === 1) return current
        return current.filter((d) => d !== level)
      }
      return [...current, level]
    })
  }

  function start() {
    if (names.length < 3) {
      setError('Il faut au moins 3 joueurs.')
      return
    }
    if (source === 'custom' && customPairs.length === 0) {
      setError('Ajoute d’abord une paire perso, ou choisis la liste par défaut.')
      return
    }
    if (source !== 'pick' && pool.length === 0) {
      setError('Aucune paire ne correspond à ces filtres.')
      return
    }
    const picked = source === 'pick' ? pool.find((p) => p.id === pickedId) ?? null : null
    if (source === 'pick' && !picked) {
      setError('Choisis une paire, ou passe en tirage au sort.')
      return
    }
    setError('')
    onStart({
      names,
      undercover: roles.undercover,
      white: roles.white,
      source,
      picked,
      difficulties,
      category,
    })
  }

  return (
    <div className="page">
      <header className="topbar">
        <button type="button" className="btn btn-back" onClick={onBack}>
          Retour
        </button>
        <h1>Nouvelle partie</h1>
      </header>

      <section className="card">
        <h2>Joueurs</h2>
        <form className="add-row" onSubmit={addName}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Prénom"
            maxLength={16}
          />
          <button type="submit" className="btn btn-primary btn-compact">
            Ajouter
          </button>
        </form>
        {names.length === 0 ? (
          <p className="hint">Ajoute au moins 3 prénoms. Un seul téléphone suffit.</p>
        ) : (
          <ul className="chips">
            {names.map((n) => (
              <li key={n}>
                <button type="button" className="chip" onClick={() => removeName(n)}>
                  {n} <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Rôles</h2>
          <button
            type="button"
            className="btn btn-text"
            onClick={() => {
              setUndercover(suggested.undercover)
              setWhite(suggested.white)
            }}
          >
            Suggestion
          </button>
        </div>
        <p className="hint">
          {names.length < 3
            ? 'Les civils doivent rester majoritaires. Ajoute encore des joueurs pour lancer.'
            : `Les civils doivent rester majoritaires. Suggestion pour ${names.length} joueurs : ${suggested.undercover} undercover, ${suggested.white} Mr. White.`}
        </p>
        <div className="steppers">
          <Stepper
            role="undercover"
            label="Undercover"
            value={roles.undercover}
            min={roles.white === 0 ? 1 : 0}
            max={maxInf}
            onChange={setUndercover}
          />
          <Stepper
            role="white"
            label="Mr. White"
            value={roles.white}
            min={0}
            max={Math.min(2, maxInf)}
            onChange={setWhite}
          />
        </div>
        {names.length >= 3 ? (
          <p className="role-summary">
            {civilians} civil{civilians > 1 ? 's' : ''} · {roles.undercover} undercover · {roles.white} Mr. White
          </p>
        ) : null}
      </section>

      <section className="card">
        <h2>Mots</h2>
        <div className="choice-list">
          {(
            [
              ['default', 'Liste par défaut', `${defaultPairs.length} paires prêtes`],
              ['custom', 'Mes paires', customPairs.length ? `${customPairs.length} perso` : 'À créer'],
              ['all', 'Toutes les paires', 'Défaut + perso'],
              ['pick', 'Choisir une paire', 'Tu décides'],
            ] as const
          ).map(([id, label, hint]) => (
            <button
              key={id}
              type="button"
              className={source === id ? 'choice active' : 'choice'}
              onClick={() => setSource(id)}
            >
              <span className="choice-mark" aria-hidden="true" />
              <span>
                <strong>{label}</strong>
                <em>{hint}</em>
              </span>
            </button>
          ))}
        </div>
        <div className="filters tight">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">Toutes les catégories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            {customPairs.some((p) => p.category === 'Perso') ? (
              <option value="Perso">Perso</option>
            ) : null}
          </select>
        </div>
        <div className="diff-row">
          {(['facile', 'moyen', 'difficile'] as const).map((level) => (
            <button
              key={level}
              type="button"
              className={difficulties.includes(level) ? 'pill active' : 'pill'}
              onClick={() => toggleDifficulty(level)}
            >
              {level}
            </button>
          ))}
        </div>
        {source === 'pick' ? (
          <label>
            Paire
            <select value={pickedId} onChange={(e) => setPickedId(e.target.value)}>
              <option value="">Choisir…</option>
              {pool.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.civilian} ↔ {p.undercover}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="hint">{pool.length} paire{pool.length > 1 ? 's' : ''} possible{pool.length > 1 ? 's' : ''}.</p>
        )}
      </section>

      {error ? <p className="error">{error}</p> : null}
      <button type="button" className="btn btn-primary" onClick={start}>
        Distribuer les mots
      </button>
    </div>
  )
}

function Stepper({
  role,
  label,
  value,
  min,
  max,
  onChange,
}: {
  role: 'undercover' | 'white'
  label: string
  value: number
  min: number
  max: number
  onChange: (n: number) => void
}) {
  return (
    <div className="stepper">
      <span className="stepper-label">
        <RoleArt role={role} className="role-art sm" />
        {label}
      </span>
      <div>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label={`Moins de ${label}`}>
          −
        </button>
        <strong>{value}</strong>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} aria-label={`Plus de ${label}`}>
          +
        </button>
      </div>
    </div>
  )
}
