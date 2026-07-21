import { useState } from 'react'
import {
	ArrowLeftIcon,
	ArrowPathIcon,
	CubeTransparentIcon,
	PlayIcon,
	SparklesIcon,
	TrashIcon,
} from '@heroicons/react/24/outline'
import History from './History'
import type { DrawMode, PieceTarget, TowerDraw, TowerLevel } from '../types'

const ASSET_BASE = import.meta.env.BASE_URL
const LEVELS: TowerLevel[] = ['Inferior', 'Central', 'Superior']
const TARGETS: PieceTarget[] = [
	'Fundo',
	'Frente',
	'Centro (frente-fundo)',
	'Centro (esquerda-direita)',
	'Esquerda',
	'Direita',
]

const TARGET_IMAGE_BY_TARGET: Record<PieceTarget, string> = {
	Fundo: 'fundo.svg',
	Frente: 'frente.svg',
	'Centro (frente-fundo)': 'centro_frente_fundo.svg',
	'Centro (esquerda-direita)': 'centro_dir_esq.svg',
	Esquerda: 'esquerda.svg',
	Direita: 'direita.svg',
}

type Screen = 'home' | 'game'
type RollingTarget = 'level' | 'target' | 'both' | null

function pickRandom<T>(items: T[]) {
	return items[Math.floor(Math.random() * items.length)]
}

function makeDraw(turn: number, level: TowerLevel, target: PieceTarget, mode: DrawMode): TowerDraw {
	return {
		id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
		turn,
		level,
		target,
		mode,
	}
}

export default function Game() {
	const [screen, setScreen] = useState<Screen>('home')
	const [mode, setMode] = useState<DrawMode>('combined')
	const [draws, setDraws] = useState<TowerDraw[]>([])
	const [pendingLevel, setPendingLevel] = useState<TowerLevel | null>(null)
	const [pendingTarget, setPendingTarget] = useState<PieceTarget | null>(null)
	const [previewLevel, setPreviewLevel] = useState<TowerLevel | null>(null)
	const [previewTarget, setPreviewTarget] = useState<PieceTarget | null>(null)
	const [rollingTarget, setRollingTarget] = useState<RollingTarget>(null)

	const currentDraw = draws[0] ?? null
	const isManualPairInProgress =
		mode === 'manual' &&
		(pendingLevel !== null ||
			pendingTarget !== null ||
			rollingTarget === 'level' ||
			rollingTarget === 'target')
	const selectedLevel =
		previewLevel ??
		pendingLevel ??
		(isManualPairInProgress ? null : (currentDraw?.level ?? null))
	const selectedTarget =
		previewTarget ??
		pendingTarget ??
		(isManualPairInProgress ? null : (currentDraw?.target ?? null))
	const isRolling = rollingTarget !== null

	function runRoll(
		target: Exclude<RollingTarget, null>,
		finalLevel: TowerLevel | null,
		finalTarget: PieceTarget | null,
		onDone: () => void
	) {
		let ticks = 0
		setRollingTarget(target)

		const intervalId = window.setInterval(() => {
			ticks += 1

			if (target === 'level' || target === 'both') {
				setPreviewLevel(pickRandom(LEVELS))
			}

			if (target === 'target' || target === 'both') {
				setPreviewTarget(pickRandom(TARGETS))
			}

			if (ticks >= 16) {
				window.clearInterval(intervalId)
				setPreviewLevel(finalLevel)
				setPreviewTarget(finalTarget)
				setRollingTarget(null)
				onDone()
			}
		}, 70)
	}

	function changeMode(nextMode: DrawMode) {
		setMode(nextMode)
		setPendingLevel(null)
		setPendingTarget(null)
		setPreviewLevel(null)
		setPreviewTarget(null)
	}

	function registerDraw(level: TowerLevel, target: PieceTarget, drawMode = mode) {
		setDraws((previousDraws) => [
			makeDraw(previousDraws.length + 1, level, target, drawMode),
			...previousDraws,
		])
	}

	function drawPair() {
		const nextLevel = pickRandom(LEVELS)
		const nextTarget = pickRandom(TARGETS)

		setPendingLevel(null)
		setPendingTarget(null)
		runRoll('both', nextLevel, nextTarget, () => {
			registerDraw(nextLevel, nextTarget, 'combined')
		})
	}

	function drawLevel() {
		const nextLevel = pickRandom(LEVELS)

		runRoll('level', nextLevel, pendingTarget, () => {
			setPendingLevel(nextLevel)
			saveAutoPair(nextLevel, pendingTarget)
		})
	}

	function drawTarget() {
		const nextTarget = pickRandom(TARGETS)

		runRoll('target', pendingLevel, nextTarget, () => {
			setPendingTarget(nextTarget)
			saveAutoPair(pendingLevel, nextTarget)
		})
	}

	function saveAutoPair(level: TowerLevel | null, target: PieceTarget | null) {
		if (!level || !target) return

		registerDraw(level, target, 'auto')
		setPendingLevel(null)
		setPendingTarget(null)
		setPreviewLevel(null)
		setPreviewTarget(null)
	}

	function resetGame() {
		setDraws([])
		setPendingLevel(null)
		setPendingTarget(null)
		setPreviewLevel(null)
		setPreviewTarget(null)
		setRollingTarget(null)
	}

	if (screen === 'home') {
		return (
			<section className="intro-screen">
				<img className="brand-mark" src={`${ASSET_BASE}logo.svg`} alt="Caiu Perdeu" />

				<div className="intro-copy">
					<p className="eyebrow">Sorteador de ações</p>
					<h1>Torre de Peças</h1>
					<p className="subtitle">
						Um sorteador para deixar cada jogada ainda mais desafiadora: defina o alvo
						da vez e tente retirar a peça sem derrubar a torre
					</p>

					<div className="setup-panel-start">
						<button className="btn-primary-start" onClick={() => setScreen('game')}>
							<PlayIcon className="btn-icon" />
							Começar a jogar
						</button>
					</div>
				</div>
			</section>
		)
	}

	return (
		<>
			<header className="game-header">
				<button className="icon-btn" onClick={() => setScreen('home')} aria-label="Voltar">
					<ArrowLeftIcon className="icon" />
				</button>
			</header>

			<section className="game-layout">
				<TowerIllustration
					variant="playing"
					level={selectedLevel}
					target={selectedTarget}
					isRolling={isRolling}
				/>

				<div className="draw-panel">
					<ModeSelector mode={mode} setMode={changeMode} compact disabled={isRolling} />

					<DrawResult
						level={selectedLevel}
						target={selectedTarget}
						isRolling={isRolling}
					/>

					<div className="wheel-board" aria-label="Acompanhamento do sorteio">
						<OptionRail
							title="Nível da torre"
							options={LEVELS}
							selected={selectedLevel}
							isRolling={rollingTarget === 'level' || rollingTarget === 'both'}
						/>
						<OptionRail
							title="Alvo da retirada"
							options={TARGETS}
							selected={selectedTarget}
							isRolling={rollingTarget === 'target' || rollingTarget === 'both'}
						/>
					</div>

					{mode === 'combined' ? (
						<button className="btn-primary" onClick={drawPair} disabled={isRolling}>
							<SparklesIcon className="btn-icon" />
							Sortear conjunto
						</button>
					) : (
						<div className="manual-actions">
							<button
								className="btn-primary"
								onClick={drawLevel}
								disabled={isRolling}
							>
								<SparklesIcon className="btn-icon" />
								Sortear nível
							</button>
							<button
								className="btn-primary"
								onClick={drawTarget}
								disabled={isRolling}
							>
								<SparklesIcon className="btn-icon" />
								Sortear alvo
							</button>
						</div>
					)}

					<button
						className="btn-secondary"
						onClick={resetGame}
						disabled={isRolling || draws.length === 0}
					>
						<ArrowPathIcon className="btn-icon" />
						Resetar partida
					</button>
				</div>
			</section>

			<section className="history-section">
				<div className="section-header">
					<h2>Histórico</h2>
					<button
						className="icon-btn danger"
						onClick={resetGame}
						disabled={isRolling || draws.length === 0}
						aria-label="Limpar histórico"
					>
						<TrashIcon className="icon" />
					</button>
				</div>
				<History draws={draws} />
			</section>
		</>
	)
}

interface ModeSelectorProps {
	mode: DrawMode
	setMode: (mode: DrawMode) => void
	compact?: boolean
	disabled?: boolean
}

function ModeSelector({ mode, setMode, compact = false, disabled = false }: ModeSelectorProps) {
	return (
		<div className={`mode-selector ${compact ? 'is-compact' : ''}`}>
			<span>Modo de sorteio</span>
			<div className="segmented-control">
				<button
					className={mode === 'combined' ? 'is-active' : ''}
					onClick={() => setMode('combined')}
					disabled={disabled}
					type="button"
				>
					Conjunto
				</button>
				<button
					className={mode === 'manual' ? 'is-active' : ''}
					onClick={() => setMode('manual')}
					disabled={disabled}
					type="button"
				>
					Individual
				</button>
			</div>
		</div>
	)
}

interface DrawResultProps {
	level: TowerLevel | null
	target: PieceTarget | null
	isRolling: boolean
}

function DrawResult({ level, target, isRolling }: DrawResultProps) {
	const hasAnyResult = level || target

	return (
		<div className={`draw-result ${isRolling ? 'is-rolling' : ''}`} aria-live="polite">
			{hasAnyResult ? (
				<>
					<span className="draw-label">
						{isRolling ? 'Sorteando...' : 'Resultado atual'}
					</span>
					<strong>{level ?? 'Nível pendente'}</strong>
					<span className="draw-separator">+</span>
					<strong>{target ?? 'Alvo pendente'}</strong>
				</>
			) : (
				<>
					<CubeTransparentIcon className="empty-icon" />
					<span className="draw-label">Nenhum sorteio iniciado</span>
				</>
			)}
		</div>
	)
}

interface OptionRailProps<T extends string> {
	title: string
	options: T[]
	selected: T | null
	isRolling: boolean
}

function OptionRail<T extends string>({ title, options, selected, isRolling }: OptionRailProps<T>) {
	return (
		<div className={`option-rail ${isRolling ? 'is-rolling' : ''}`}>
			<span>{title}</span>
			<div className="option-track">
				{options.map((option) => (
					<span className={selected === option ? 'is-selected' : ''} key={option}>
						{option}
					</span>
				))}
			</div>
		</div>
	)
}

interface TowerIllustrationProps {
	variant: 'initial' | 'playing'
	level?: TowerLevel | null
	target?: PieceTarget | null
	isRolling?: boolean
}

function TowerIllustration({
	variant,
	level = null,
	target = null,
	isRolling = false,
}: TowerIllustrationProps) {
	const imageName = target ? TARGET_IMAGE_BY_TARGET[target] : 'limpo.svg'
	const imageSrc = `${ASSET_BASE}alvo_da_retirada/${imageName}`

	return (
		<div
			className={`tower-scene ${isRolling ? 'is-rolling' : ''}`}
			aria-label="Ilustração da torre"
		>
			<img className="tower-art" src={imageSrc} alt="" />

			{variant === 'playing' && (
				<div className="tower-callout">
					{level && target ? (
						<>
							<strong>{level}</strong>
							<span>{target}</span>
						</>
					) : (
						<span>Aguardando sorteio</span>
					)}
				</div>
			)}
		</div>
	)
}
