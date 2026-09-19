type HowToProps = {
  onBack: () => void
}

export function HowTo({ onBack }: HowToProps) {
  return (
    <div className="page">
      <header className="topbar">
        <button type="button" className="btn btn-back" onClick={onBack}>
          Retour
        </button>
        <h1>Comment jouer</h1>
      </header>

      <section className="card">
        <h2>Le principe</h2>
        <p>
          Chaque partie repose sur une paire de mots proches, comme café et thé.
          Les civils reçoivent tous le même mot. Les undercovers reçoivent l’autre.
          Mr. White n’en reçoit aucun.
        </p>
        <p className="note">
          Personne ne sait s’il est civil ou undercover. On le découvre en
          écoutant les indices.
        </p>
      </section>

      <section className="card">
        <h2>Les rôles</h2>
        <ul className="role-list">
          <li>
            <strong>Civils</strong> — même mot. Éliminez tous les infiltrés.
          </li>
          <li>
            <strong>Undercover</strong> — mot voisin. Survivez jusqu’à ce qu’il
            ne reste plus qu’un civil.
          </li>
          <li>
            <strong>Mr. White</strong> — aucun mot. Bluffez, ou gagnez en
            devinant le mot des civils si vous êtes éliminé.
          </li>
        </ul>
      </section>

      <section className="card">
        <h2>Un tour</h2>
        <ol className="steps">
          <li>Chacun décrit son mot avec un seul mot, assez vague.</li>
          <li>On discute : qui sonne faux, trop précis, trop flou ?</li>
          <li>On vote. Le rôle du joueur éliminé est révélé.</li>
        </ol>
      </section>

      <section className="card">
        <h2>Victoire</h2>
        <ul className="role-list">
          <li>Les civils gagnent s’ils éliminent tous les infiltrés.</li>
          <li>Les infiltrés gagnent s’il ne reste plus qu’un civil.</li>
          <li>Mr. White gagne s’il trouve le mot des civils.</li>
        </ul>
      </section>
    </div>
  )
}
