import type { TowerDraw } from "../types"

interface Props {
  draws: TowerDraw[]
}

export default function History({ draws }: Props) {
  if (draws.length === 0) {
    return (
      <div className="empty-history">
        Os conjuntos sorteados aparecerão aqui durante a partida
      </div>
	  )
  }

  return (
    <div className="history">
      {draws.map((draw) => (
        <article className="round-card" key={draw.id}>
          <div className="round-header">
            <span>Sorteio {draw.turn}</span>
            <small>{draw.mode === "combined" ? "conjunto" : "individual"}</small>
          </div>
          <div className="round-row">
            <span className="round-player">Nível</span>
            <strong className="round-score">{draw.level}</strong>
          </div>
          <div className="round-row">
            <span className="round-player">Alvo</span>
            <strong className="round-score">{draw.target}</strong>
          </div>
        </article>
      ))}
    </div>
  )
}
