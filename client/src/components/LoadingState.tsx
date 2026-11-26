export default function LoadingState({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-amber-400"
        aria-hidden="true"
      />
      <p>{message}</p>
    </div>
  );
}
