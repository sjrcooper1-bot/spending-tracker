/**
 * FileCard
 * Shows a single uploaded file — its name, transaction count, and a remove button.
 */
export default function FileCard({ filename, rowCount, onRemove }) {
  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        {/* File icon */}
        <svg
          className="shrink-0 text-blue-400"
          width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>

        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{filename}</p>
          <p className="text-xs text-gray-400">
            {rowCount === 1 ? '1 transaction' : `${rowCount.toLocaleString()} transactions`}
          </p>
        </div>
      </div>

      <button
        onClick={onRemove}
        aria-label={`Remove ${filename}`}
        className="ml-4 shrink-0 text-gray-400 hover:text-red-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
