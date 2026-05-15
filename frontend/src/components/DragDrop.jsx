import { useState, useRef, useCallback } from 'react';

const DragDrop = ({ onFileSelect, accept = '.pdf,.docx', maxSize = 5 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const validateFile = (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF and DOCX files are allowed.';
    }

    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB.`;
    }

    return null;
  };

  const handleFile = useCallback(
    (file) => {
      setError('');
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect, maxSize]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError('');
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
          isDragging
            ? 'border-primary-400 bg-primary-500/10 scale-[1.02]'
            : selectedFile
            ? 'border-accent-500/50 bg-accent-500/5'
            : 'border-dark-600 hover:border-primary-500/50 hover:bg-dark-800/30'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-3 animate-scale-in">
            <div className="w-14 h-14 rounded-xl bg-accent-500/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">{selectedFile.name}</p>
              <p className="text-sm text-dark-400 mt-1">{formatSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={removeFile}
              className="text-sm text-red-400 hover:text-red-300 hover:underline transition-colors"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-primary-500/10 flex items-center justify-center animate-float">
              <svg className="w-7 h-7 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">
                Drop your resume here or{' '}
                <span className="text-primary-400">browse</span>
              </p>
              <p className="text-sm text-dark-400 mt-1">
                Supports PDF and DOCX (max {maxSize}MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-400 animate-fade-in">{error}</p>
      )}
    </div>
  );
};

export default DragDrop;
