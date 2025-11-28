"use client";
import { useEffect, useState } from "react";

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/metrics")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => setMetrics(Array.isArray(data) ? data : [data]))
      .catch((e) => setError(e.message || "Erreur de chargement des métriques"))
      .finally(() => setLoading(false));
  }, []);

  // Calculs dynamiques
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

  return { bestAccuracy, support, nbModels, loading, error };
}
