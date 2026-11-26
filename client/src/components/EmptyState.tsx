import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-12 text-center">
      <span className="text-4xl" aria-hidden="true">
        🎞️
      </span>
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      {description ? <p className="max-w-md text-sm text-slate-400">{description}</p> : null}
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}
