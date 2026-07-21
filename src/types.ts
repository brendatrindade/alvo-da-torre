export type DrawMode = 'combined' | 'manual' | 'auto'

export type TowerLevel = 'Inferior' | 'Central' | 'Superior'

export type PieceTarget =
	| 'Fundo'
	| 'Frente'
	| 'Centro (frente-fundo)'
	| 'Centro (esquerda-direita)'
	| 'Esquerda'
	| 'Direita'

export type TowerDraw = {
	id: string
	turn: number
	level: TowerLevel
	target: PieceTarget
	mode: DrawMode
}
