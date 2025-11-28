"use client";

import Reveal from "@/components/Reveal";
import { Fragment, useEffect, useState } from "react";

// Types pour les deux modèles
type PerfMetricsB2 = {
  model: string;
  accuracy: number;
  f1: number;
  latency_ms: number;
  classes: string[];
  cm: number[][];
  classification_report: any;
};

type PerfMetricsB4 = {
  model_name: string;
  global_metrics: {
    auc_roc: number;
    auc_pr: number;
  };
  optimal_threshold: number;
  metrics_at_threshold: {
    precision_malignant: number;
    recall_malignant: number;
    f1_malignant: number;
    accuracy_global: number;
  };
  confusion_matrix: {
    benign: { pred_benign: number; pred_malignant: number };
    malignant: { pred_benign: number; pred_malignant: number };
  };
};

type PerfMetrics = PerfMetricsB2 | PerfMetricsB4;

export default function PerformancePage() {
		// Tous les hooks d'abord

		// Calcul dashboard (juste avant return)
	const [metrics, setMetrics] = useState<PerfMetrics[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

	useEffect(() => {
		setLoading(true);
		setError(null);
		fetch(`${apiBase}/metrics`)
			.then((r) => {
				if (!r.ok) throw new Error(`HTTP ${r.status}`);
				return r.json();
			})
			.then((data) => setMetrics(Array.isArray(data) ? data : [data]))
			.catch((e) => setError(e.message || "Erreur de chargement des métriques"))
			.finally(() => setLoading(false));
	}, [apiBase]);

	// Calcul dashboard (juste avant return)
	let bestAccuracy = 0;
	let support = 0;
	let nbModels = 0;
	if (metrics && metrics.length > 0) {
		bestAccuracy = metrics.reduce((max, m) => {
			if ('accuracy' in m) return Math.max(max, m.accuracy);
			if ('metrics_at_threshold' in m) return Math.max(max, m.metrics_at_threshold.accuracy_global);
			return max;
		}, 0);
		support = metrics.reduce((max, m) => {
			if ('classification_report' in m && m.classification_report['weighted avg']?.support) {
				return Math.max(max, m.classification_report['weighted avg'].support);
			}
			return max;
		}, 0);
		nbModels = metrics.length;
	}

	return (
		<section className="section section-soft-bg">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="section-title">
					<span className="tag-accent">Performance</span>
			<h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">Évaluation des modèles</h1>
					<div className="title-underline" />
					<p className="mt-3 text-slate-600 max-w-2xl mx-auto text-center">
						Aperçu des métriques clés et des courbes: ROC, PR, matrice de confusion, courbes d'entraînement.
					</p>
				</div>

				{/* Affichage pour chaque modèle */}
				<div className="mt-8 grid gap-10 ">
					{loading ? (
						<div className="kpi-card col-span-4 text-center">Chargement des métriques...</div>
					) : error ? (
						<div className="kpi-card col-span-4 text-center text-red-600">{error}</div>
					) : metrics.length > 0 ? (
						metrics.map((m, idx) => (
							<div key={idx} className="card p-6 ">
								<h2 className="font-bold text-xl mb-2">
									{('model' in m ? m.model : m.model_name) || `Modèle #${idx+1}`}
								</h2>
								{/* KPI Cards */}
								<div className="kpi-grid mb-6 ">
									{/* Harmonisation B4 et B2 */}
									{'global_metrics' in m ? (
										<>
											<Reveal><div className="kpi-card"><div className="kpi-label">Accuracy</div><div className="kpi-value">{(m.metrics_at_threshold.accuracy_global * 100).toFixed(2)}%</div><div className="kpi-sub">Exactitude globale</div></div></Reveal>
											<Reveal delay={80}><div className="kpi-card"><div className="kpi-label">F1‑Score</div><div className="kpi-value">{(m.metrics_at_threshold.f1_malignant * 100).toFixed(2)}%</div><div className="kpi-sub">F1-score Malin</div></div></Reveal>
											<Reveal delay={120}><div className="kpi-card"><div className="kpi-label">ROC‑AUC</div><div className="kpi-value">{(m.global_metrics.auc_roc * 100).toFixed(2)}%</div><div className="kpi-sub">Surface sous la courbe</div></div></Reveal>
											<Reveal delay={160}><div className="kpi-card"><div className="kpi-label">PR‑AUC</div><div className="kpi-value">{(m.global_metrics.auc_pr * 100).toFixed(2)}%</div><div className="kpi-sub">Surface PR</div></div></Reveal>
											<Reveal delay={200}><div className="kpi-card"><div className="kpi-label">Threshold optimal</div><div className="kpi-value">{m.optimal_threshold}</div><div className="kpi-sub">Seuil optimal</div></div></Reveal>
										</>
									) : (
										<>
											<Reveal><div className="kpi-card"><div className="kpi-label">Accuracy</div><div className="kpi-value">{(m.accuracy * 100).toFixed(2)}%</div><div className="kpi-sub">Exactitude globale</div></div></Reveal>
											<Reveal delay={80}><div className="kpi-card"><div className="kpi-label">F1‑Score</div><div className="kpi-value">{(m.f1 * 100).toFixed(2)}%</div><div className="kpi-sub">Harmonique Précision/Rappel</div></div></Reveal>
											<Reveal delay={120}><div className="kpi-card"><div className="kpi-label">Latence</div><div className="kpi-value">{m.latency_ms} ms</div><div className="kpi-sub">Temps d'inférence</div></div></Reveal>
										</>
									)}
								</div>
								{/* Matrice de confusion harmonisée */}
								{'global_metrics' in m ? (
									<div className="mt-6">
										<h3 className="font-semibold mb-2">Matrice de confusion</h3>
										<ConfusionMatrix cm={[
											[m.confusion_matrix.benign.pred_benign, m.confusion_matrix.benign.pred_malignant],
											[m.confusion_matrix.malignant.pred_benign, m.confusion_matrix.malignant.pred_malignant],
											]} labels={["Bénin", "Malin"]} />
										
									</div>
								) : (
									<div className="mt-6">
										<h3 className="font-semibold mb-2">Matrice de confusion</h3>
										<ConfusionMatrix cm={m.cm} labels={m.classes} />
										{/* <div className="text-xs text-slate-500 mt-2">Intensité = fréquence</div> */}
									</div>
								)}
							</div>
						))
					) : null}
				</div>
			</div>
		</section>
	);

function svgPath(points: [number, number][] | undefined | null, width: number, height: number) {
	const safePoints = Array.isArray(points) ? points : [];
	const toXY = (p: [number, number]) => {
		const [x, y] = p;
		return [x * width, (1 - y) * height];
	};
	return safePoints
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
	const safeLoss = Array.isArray(loss) ? loss : [];
	const safeAcc = Array.isArray(acc) ? acc : [];
	const n = Math.max(safeLoss.length, safeAcc.length);
	if (n === 0) {
		return <div className="text-center text-slate-500 py-8">Aucune donnée d'entraînement disponible.</div>;
	}
	const toXY = (i: number, v: number, min: number, max: number) => {
		const x = n > 1 ? (i / (n - 1)) * (width - pad * 2) : 0;
		const y = max !== min ? (1 - (v - min) / (max - min)) * (height - pad * 2) : height / 2;
		return [x, y];
	};
	const lossMin = safeLoss.length ? Math.min(...safeLoss) : 0, lossMax = safeLoss.length ? Math.max(...safeLoss) : 1;
	const accMin = safeAcc.length ? Math.min(...safeAcc) : 0, accMax = safeAcc.length ? Math.max(...safeAcc) : 1;
	const lossPath = safeLoss
		.map((v, i) => {
			const [x, y] = toXY(i, v, lossMin, lossMax);
			return `${i === 0 ? "M" : "L"}${x},${y}`;
		})
		.join(" ");
	const accPath = safeAcc
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

function ConfusionMatrixB4({ cm }: { cm: { benign: { pred_benign: number; pred_malignant: number }; malignant: { pred_benign: number; pred_malignant: number } } }) {
  const totalBenign = cm.benign.pred_benign + cm.benign.pred_malignant;
  const totalMalignant = cm.malignant.pred_benign + cm.malignant.pred_malignant;
  const total = totalBenign + totalMalignant;
  const percent = (n: number) => total ? ((n / total) * 100).toFixed(1) + '%' : '-';
  return (
    <table className="cm-table">
      <thead>
        <tr>
          <th></th>
          <th>Préd: Bénin</th>
          <th>Préd: Malin</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th>Vrai: Bénin</th>
          <td>{cm.benign.pred_benign}<br /><span className="cm-percent">{percent(cm.benign.pred_benign)}</span></td>
          <td>{cm.benign.pred_malignant}<br /><span className="cm-percent">{percent(cm.benign.pred_malignant)}</span></td>
        </tr>
        <tr>
          <th>Vrai: Malin</th>
          <td>{cm.malignant.pred_benign}<br /><span className="cm-percent">{percent(cm.malignant.pred_benign)}</span></td>
          <td>{cm.malignant.pred_malignant}<br /><span className="cm-percent">{percent(cm.malignant.pred_malignant)}</span></td>
        </tr>
      </tbody>
    </table>
  );
}
