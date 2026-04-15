import { useState } from 'react';
import { parseFiles } from './parser.js';
import { categoriseAll, DEFAULT_RULES } from './categoriser.js';
import DropZone from './components/DropZone.jsx';
import FileCard from './components/FileCard.jsx';
import ErrorBanner from './components/ErrorBanner.jsx';
import TransactionTable from './components/TransactionTable.jsx';

export default function App() {
  // Each entry: { filename: string, rowCount: number }
  const [uploadedFiles, setUploadedFiles] = useState([]);
  // Flat array of all parsed transactions across all files
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [parsing, setParsing] = useState(false);

  async function handleFiles(fileList) {
    setError(null);
    setParsing(true);

    try {
      const newFiles = Array.from(fileList);

      // Deduplicate: skip files already loaded by name
      const existingNames = new Set(uploadedFiles.map(f => f.filename));
      const filesToParse = newFiles.filter(f => !existingNames.has(f.name));

      if (!filesToParse.length) {
        setError('Those files are already loaded.');
        return;
      }

      const newTransactions = await parseFiles(filesToParse);
      categoriseAll(newTransactions, DEFAULT_RULES);

      // Build file cards from the actual parsed results
      const newFileCards = filesToParse.map(f => ({
        filename: f.name,
        rowCount: newTransactions.filter(t => t.source === f.name).length,
      }));

      setUploadedFiles(prev => [...prev, ...newFileCards]);
      setTransactions(prev => [...prev, ...newTransactions]);
    } catch (err) {
      setError(err.message);
    } finally {
      setParsing(false);
    }
  }

  function handleRemoveFile(filename) {
    setUploadedFiles(prev => prev.filter(f => f.filename !== filename));
    setTransactions(prev => prev.filter(t => t.source !== filename));
    setError(null);
  }

  function handleClearAll() {
    setUploadedFiles([]);
    setTransactions([]);
    setError(null);
  }

  const hasFiles = uploadedFiles.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Spending Analyser</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Everything stays in your browser — nothing is sent anywhere.
            </p>
          </div>
          {hasFiles && (
            <button
              onClick={handleClearAll}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded px-3 py-1.5"
            >
              Clear all
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Drop zone */}
        <DropZone onFiles={handleFiles} disabled={parsing} />

        {/* Error */}
        <ErrorBanner message={error} onDismiss={() => setError(null)} />

        {/* Loading indicator */}
        {parsing && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Parsing file…
          </div>
        )}

        {/* File cards */}
        {hasFiles && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Loaded files</p>
            <div className="space-y-2">
              {uploadedFiles.map(f => (
                <FileCard
                  key={f.filename}
                  filename={f.filename}
                  rowCount={f.rowCount}
                  onRemove={() => handleRemoveFile(f.filename)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Analyse button */}
        {hasFiles && (
          <div className="flex justify-end">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50"
              disabled={parsing}
              onClick={() => {/* Phase 2 */}}
            >
              Analyse spending →
            </button>
          </div>
        )}

        {/* Transaction preview */}
        {hasFiles && <TransactionTable transactions={transactions} />}
      </main>
    </div>
  );
}
