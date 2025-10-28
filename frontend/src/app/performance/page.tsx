"use client";

import ProgressBar from "@/components/ProgressBar";
import Reveal from "@/components/Reveal";
import { Fragment, useMemo } from "react";

export default function PerformancePage() {
	const models = [
		{ name: "CNN-Base", accuracy: 0.82, precision: 0.8, recall: 0.78, f1: 0.79 },
		{ name: "EfficientNet-B0", accuracy: 0.87, precision: 0.85, recall: 0.84, f1: 0.84 },
		{ name: "ResNet50", accuracy: 0.85, precision: 0.83, recall: 0.82, f1: 0.82 },
	];

	// Example performance snapshot (static demo data)
	const perf = useMemo(
		() => ({
			auc: 0.94,
			accuracy: 0.91,
			f1: 0.9,
			latency_ms: 142,
			classes: ["Bénin", "Malin"],
			cm: [
				[82, 6],
				[7, 65],
			],
			roc: [
				[0, 0], [0.05, 0.35], [0.12, 0.62], [0.22, 0.78], [0.35, 0.86], [0.5, 0.92], [0.7, 0.95], [1, 1],
			],
			pr: [
				[0, 1], [0.1, 0.92], [0.3, 0.88], [0.5, 0.83], [0.7, 0.78], [0.9, 0.7], [1, 0.65],
			],
			loss: [0.68, 0.54, 0.43, 0.36, 0.31, 0.28, 0.26, 0.25],
			acc: [0.62, 0.71, 0.78, 0.83, 0.86, 0.88, 0.9, 0.91],
		}),
		[]
	);

	return (
		<section className="section section-soft-bg">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="section-title">
					<span className="tag-accent">Performance</span>
					<h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">Évaluation du modèle</h1>
					<div className="title-underline" />
					<p className="mt-3 text-slate-600 max-w-2xl mx-auto text-center">
						Aperçu des métriques clés et des courbes: ROC, PR, matrice de confusion, courbes d'entraînement.
					</p>
				</div>

				{/* KPI cards */}
				<div className="mt-8 kpi-grid">
					<Reveal>
						<div className="kpi-card">
							<div className="kpi-label">ROC‑AUC</div>
							<div className="kpi-value">{(perf.auc * 100).toFixed(1)}%</div>
							<div className="kpi-sub">Surface sous la courbe</div>
						</div>
					</Reveal>
					<Reveal delay={80}>
						<div className="kpi-card">
							<div className="kpi-label">Accuracy</div>
							<div className="kpi-value">{(perf.accuracy * 100).toFixed(1)}%</div>
							<div className="kpi-sub">Exactitude globale</div>
						</div>
					</Reveal>
					<Reveal delay={120}>
						<div className="kpi-card">
							<div className="kpi-label">F1‑Score</div>
							<div className="kpi-value">{(perf.f1 * 100).toFixed(1)}%</div>
							<div className="kpi-sub">Harmonique Précision/Rappel</div>
						</div>
					</Reveal>
					<Reveal delay={160}>
						<div className="kpi-card">
							<div className="kpi-label">Latence</div>
							<div className="kpi-value">{perf.latency_ms} ms</div>
							<div className="kpi-sub">Temps d'inférence</div>
						</div>
					</Reveal>
				</div>

				{/* Charts row 1: ROC + Confusion Matrix */}
				<div className="mt-8 grid md:grid-cols-2 gap-6">
					<Reveal>
						<div className="chart-card">
							<div className="chart-title">Courbe ROC</div>
							  <RocChart points={perf.roc as [number, number][]} />
							<div className="legend">
								<span className="dot dot-primary" /> Modèle
								<span className="sep" /> Diagonale aléatoire
							</div>
						</div>
					</Reveal>
					<Reveal delay={80}>
						<div className="chart-card">
							<div className="chart-title">Matrice de confusion</div>
							<ConfusionMatrix cm={perf.cm} labels={perf.classes} />
						</div>
					</Reveal>
				</div>

				{/* Charts row 2: Loss/Accuracy + PR */}
				<div className="mt-6 grid md:grid-cols-2 gap-6">
					<Reveal>
						<div className="chart-card">
							<div className="chart-title">Entraînement: Perte & Accuracy</div>
							<TrainCurves loss={perf.loss} acc={perf.acc} />
							<div className="legend">
								<span className="dot dot-secondary" /> Loss
								<span className="sep" />
								<span className="dot dot-primary" /> Accuracy
							</div>
						</div>
					</Reveal>
					<Reveal delay={80}>
						<div className="chart-card">
							<div className="chart-title">Courbe Précision‑Rappel</div>
							  <PrChart points={perf.pr as [number, number][]} />
							<div className="legend">
								<span className="dot dot-primary" /> Modèle
							</div>
						</div>
					</Reveal>
				</div>

				{/* Model comparison table */}
				<Reveal>
					<div className="mt-10 card">
						<h2 className="font-semibold text-lg">Comparaison des modèles</h2>
						{(() => {
							const best = {
								accuracy: Math.max(...models.map((m) => m.accuracy)),
								precision: Math.max(...models.map((m) => m.precision)),
								recall: Math.max(...models.map((m) => m.recall)),
								f1: Math.max(...models.map((m) => m.f1)),
							};
							return (
								<div className="mt-4 overflow-x-auto table-premium">
									<table className="w-full text-left text-sm">
										<thead>
											<tr>
												<th>Modèle</th>
												<th>Accuracy</th>
												<th>Precision</th>
												<th>Recall</th>
												<th>F1</th>
											</tr>
										</thead>
										<tbody>
											{models.map((m) => (
												<tr key={m.name}>
													<td className="name-cell">
														<span className="model-name">{m.name}</span>
														{m.f1 === best.f1 && (
															<span className="badge-best" title="Meilleur F1">
																<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
																	<path d="M3 11l4-7 5 9 5-9 4 7" />
																</svg>
																Top
															</span>
														)}
													</td>
													{([m.accuracy, m.precision, m.recall, m.f1] as const).map((v, i) => {
														const isBest =
															i === 0 ? v === best.accuracy : i === 1 ? v === best.precision : i === 2 ? v === best.recall : v === best.f1;
														const color = i === 0 ? "var(--color-primary)" : i === 1 ? "var(--color-secondary)" : i === 2 ? "var(--color-accent)" : "#6366F1";
														return (
															<td key={i} className={isBest ? "cell-best" : undefined}>
																<ProgressBar percent={v * 100} color={color} />
																<span className="metric-chip">{Math.round(v * 100)}%</span>
															</td>
														);
													})}
												</tr>
											))}
										</tbody>
									</table>
								</div>
							);
						})()}
						<p className="mt-4 text-xs text-slate-500">Remarque: Connectez cette page à vos métriques réelles (p.ex., export MLflow) lorsque disponibles.</p>
					</div>
				</Reveal>
			</div>
		</section>
	);
}

function svgPath(points: [number, number][], width: number, height: number) {
	const toXY = (p: [number, number]) => {
		const [x, y] = p;
		return [x * width, (1 - y) * height];
	};
	return points
		.map((p, i) => {
			const [x, y] = toXY(p);
			return `${i === 0 ? "M" : "L"}${x},${y}`;
		})
		.join(" ");
}

function RocChart({ points }: { points: [number, number][] }) {
	const width = 520, height = 280, pad = 28;
	const path = svgPath(points, width - pad * 2, height - pad * 2);
	return (
		<svg width="100%" viewBox={`0 0 ${width} ${height}`} className="chart">
			<g transform={`translate(${pad},${pad})`}>
				<rect x={0} y={0} width={width - pad * 2} height={height - pad * 2} rx={10} ry={10} fill="#fff" stroke="rgba(2,6,23,0.06)" />
				<line x1={0} y1={height - pad * 2} x2={width - pad * 2} y2={0} stroke="#e5e7eb" strokeDasharray="4 4" />
				<path d={path} fill="none" stroke="var(--color-primary)" strokeWidth={3} />
				<Axis width={width - pad * 2} height={height - pad * 2} />
			</g>
		</svg>
	);
}

function PrChart({ points }: { points: [number, number][] }) {
	const width = 520, height = 280, pad = 28;
	const path = svgPath(points, width - pad * 2, height - pad * 2);
	return (
		<svg width="100%" viewBox={`0 0 ${width} ${height}`} className="chart">
			<g transform={`translate(${pad},${pad})`}>
				<rect x={0} y={0} width={width - pad * 2} height={height - pad * 2} rx={10} ry={10} fill="#fff" stroke="rgba(2,6,23,0.06)" />
				<path d={path} fill="none" stroke="var(--color-primary)" strokeWidth={3} />
				<Axis width={width - pad * 2} height={height - pad * 2} />
			</g>
		</svg>
	);
}

function TrainCurves({ loss, acc }: { loss: number[]; acc: number[] }) {
	const width = 520, height = 280, pad = 28;
	const n = Math.max(loss.length, acc.length);
	const toXY = (i: number, v: number, min: number, max: number) => {
		const x = (i / (n - 1)) * (width - pad * 2);
		const y = (1 - (v - min) / (max - min)) * (height - pad * 2);
		return [x, y];
	};
	const lossMin = Math.min(...loss), lossMax = Math.max(...loss);
	const accMin = Math.min(...acc), accMax = Math.max(...acc);
	const lossPath = loss
		.map((v, i) => {
			const [x, y] = toXY(i, v, lossMin, lossMax);
			return `${i === 0 ? "M" : "L"}${x},${y}`;
		})
		.join(" ");
	const accPath = acc
		.map((v, i) => {
			const [x, y] = toXY(i, v, accMin, accMax);
			return `${i === 0 ? "M" : "L"}${x},${y}`;
		})
		.join(" ");
	return (
		<svg width="100%" viewBox={`0 0 ${width} ${height}`} className="chart">
			<g transform={`translate(${pad},${pad})`}>
				<rect x={0} y={0} width={width - pad * 2} height={height - pad * 2} rx={10} ry={10} fill="#fff" stroke="rgba(2,6,23,0.06)" />
				<path d={lossPath} fill="none" stroke="var(--color-secondary)" strokeWidth={3} />
				<path d={accPath} fill="none" stroke="var(--color-primary)" strokeWidth={3} />
				<Axis width={width - pad * 2} height={height - pad * 2} />
			</g>
		</svg>
	);
}

function Axis({ width, height }: { width: number; height: number }) {
	return (
		<g>
			<line x1={0} y1={height} x2={width} y2={height} stroke="#e5e7eb" />
			<line x1={0} y1={0} x2={0} y2={height} stroke="#e5e7eb" />
			{[0, 0.5, 1].map((t) => (
				<g key={t}>
					<line x1={t * width} y1={height} x2={t * width} y2={height - 6} stroke="#94a3b8" />
					<text x={t * width} y={height + 16} fontSize={10} fill="#64748b" textAnchor="middle">{t}</text>
					<line x1={0} y1={(1 - t) * height} x2={6} y2={(1 - t) * height} stroke="#94a3b8" />
					<text x={-10} y={(1 - t) * height + 3} fontSize={10} fill="#64748b" textAnchor="end">{t}</text>
				</g>
			))}
		</g>
	);
}

function ConfusionMatrix({ cm, labels }: { cm: number[][]; labels: string[] }) {
	const n = cm.length;
	const total = cm.flat().reduce((a, b) => a + b, 0);
	const max = Math.max(...cm.flat());
	return (
		<div>
			<div className="cm-grid" style={{ gridTemplateColumns: `repeat(${n + 1}, minmax(0, 1fr))` }}>
				<div />
				{labels.map((l) => (
					<div key={`col-${l}`} className="cm-h">Préd: {l}</div>
				))}
				{cm.map((row, i) => (
					<Fragment key={`row-${i}`}>
						<div key={`rowh-${i}`} className="cm-h">Vrai: {labels[i]}</div>
						{row.map((v, j) => {
							const intensity = v / max;
							return (
								<div key={`cell-${i}-${j}`} className="cm-cell" style={{ background: `rgba(0,123,255,${0.08 + intensity * 0.28})` }}>
									<div className="cm-v">{v}</div>
									<div className="cm-p">{((v / total) * 100).toFixed(1)}%</div>
								</div>
							);
						})}
					</Fragment>
				))}
			</div>
			<div className="legend mt-2"><span className="dot dot-primary" /> Intensité = fréquence</div>
		</div>
	);
}
