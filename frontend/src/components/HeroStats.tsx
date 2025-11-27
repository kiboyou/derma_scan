"use client";

import Counter from "@/components/Counter";
import { useEffect, useState } from "react";

type Metrics = {
  accuracy: number;
  classification_report: {
    [key: string]: any;
    weighted?: any;
    "weighted avg"?: { [key: string]: any };
  };
  models: any[];
};

export default function HeroStats() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/metrics")
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  let precision = 0, images = 0, models = 0;
  if (metrics) {
    precision = (metrics.accuracy ?? 0) * 100;
    // Support = total images (from classification_report)
    images = metrics.classification_report?.["weighted avg"]?.support ?? 0;
    models = Array.isArray(metrics.models) ? metrics.models.length : 0;
  }

  return (
    <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
      <div className="card">
        <div className="text-2xl font-bold">
          {loading ? "..." : error ? "—" : <Counter value={precision} format={(v) => `${v.toFixed(1)}%`} />}
        </div>
        <div className="text-sm text-slate-600">Précision</div>
      </div>
      <div className="card">
        <div className="text-2xl font-bold">
          {loading ? "..." : error ? "—" : <Counter value={images} format={(v) => `${Math.round(v).toLocaleString()}`} />}
        </div>
        <div className="text-sm text-slate-600">Images</div>
      </div>
      <div className="card">
        <div className="text-2xl font-bold">
          {loading ? "..." : error ? "—" : <Counter value={models} />}
        </div>
        <div className="text-sm text-slate-600">Modèles</div>
      </div>
    </div>
  );
}
