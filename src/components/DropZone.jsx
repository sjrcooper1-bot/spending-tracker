import { useRef, useState } from 'react';

/**
 * DropZone
 * Drag-and-drop + click-to-browse file upload area.
 * Calls onFiles(FileList) when files are selected.
 */
export default function DropZone({ onFiles, disabled = false }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  function handleDragOver(e) {
    e.preventDefault();
    if (!disabled) setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (!disabled && e.dataTransfer.files.length) {
      onFiles(e.dataTransfer.files);
    }
  }

  function handleClick() {
    if (!disabled) inputRef.current.click();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') handleClick();
  }

  function handleChange(e) {
    if (e.target.files.length) {
      onFiles(e.target.files);
      // Reset so the same file can be re-uploaded if needed
      e.target.value = '';
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload bank statement files"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={[
        'border-2 border-dashed rounded-xl px-8 py-12 text-center cursor-pointer transition-colors select-none',
        dragging
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-gray-50',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
    >
      {/* Upload icon */}
      <svg
        className="mx-auto mb-4 text-gray-400"
        width="40" height="40" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>

      <p className="text-gray-700 font-medium">
        Drag &amp; drop your bank statements here
      </p>
      <p className="mt-1 text-sm text-gray-400">
        or click to browse — CSV, XLSX, and XLS supported
      </p>
      <p className="mt-3 text-xs text-gray-400">
        Multiple files accepted &nbsp;·&nbsp; All processing happens in your browser
      </p>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".csv,.xlsx,.xls"
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
