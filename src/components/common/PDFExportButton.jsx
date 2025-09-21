import React, { useState } from 'react';
import Button from './Button';

const PDFExportButton = ({ 
  onGeneratePDF, 
  disabled = false, 
  variant = 'primary',
  showPreview = true,
  className = '',
  label = 'Generate PDF'
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePDFGeneration = async (action) => {
    setIsGenerating(true);
    try {
      await onGeneratePDF(action);
    } finally {
      setIsGenerating(false);
    }
  };

  if (showPreview) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Button
          variant="outline"
          onClick={() => handlePDFGeneration('preview')}
          disabled={disabled || isGenerating}
          className="flex items-center gap-2"
        >
          <span>👁️</span>
          {isGenerating ? 'Generating...' : 'Preview PDF'}
        </Button>
        <Button
          variant={variant}
          onClick={() => handlePDFGeneration('download')}
          disabled={disabled || isGenerating}
          className="flex items-center gap-2"
        >
          <span>📄</span>
          {isGenerating ? 'Generating...' : label}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      onClick={() => handlePDFGeneration('download')}
      disabled={disabled || isGenerating}
      className={`flex items-center gap-2 ${className}`}
    >
      <span>📄</span>
      {isGenerating ? 'Generating...' : label}
    </Button>
  );
};

export default PDFExportButton;
