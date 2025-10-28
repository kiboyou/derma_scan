"use client";

import Counter from "@/components/Counter";

export default function HeroStats() {
  return (
    <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
      <div className="card">
        <div className="text-2xl font-bold">
          <Counter value={97.8} format={(v) => `${v.toFixed(1)}%`} />
        </div>
        <div className="text-sm text-slate-600">Précision</div>
      </div>
      <div className="card">
        <div className="text-2xl font-bold">
          <Counter value={12000} format={(v) => `${Math.round(v).toLocaleString()}`} />
        </div>
        <div className="text-sm text-slate-600">Images</div>
      </div>
      <div className="card">
        <div className="text-2xl font-bold">
          <Counter value={3} />
        </div>
        <div className="text-sm text-slate-600">Modèles</div>
      </div>
    </div>
  );
}
