type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-10 text-center">
      <p className="text-red-300">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
        >
          Tentar novamente
        </button>
      ) : null}
    </div>
  );
}
