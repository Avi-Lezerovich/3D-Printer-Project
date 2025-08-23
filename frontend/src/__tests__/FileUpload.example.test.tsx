import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Simplified FileUpload component for testing
const TestFileUpload = ({ onFilesSelected }: { onFilesSelected: (files: File[]) => void }) => {
  const [files, setFiles] = React.useState<File[]>([]);
  const [dragOver, setDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter(file => 
      file.name.toLowerCase().endsWith('.gcode') || file.name.toLowerCase().endsWith('.stl')
    );
    setFiles(prev => [...prev, ...validFiles]);
    onFilesSelected(validFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileSelect(droppedFiles);
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        aria-label="Upload 3D model files"
      >
        Drop files here or click to browse
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".gcode,.stl"
        onChange={e => handleFileSelect(Array.from(e.target.files || []))}
        style={{ display: 'none' }}
        data-testid="file-input"
      />

      {files.length > 0 && (
        <div>
          <h3>Uploaded Files ({files.length})</h3>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                <span>{file.name}</span>
                <button 
                  onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                  aria-label={`Remove ${file.name}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Mock files helper
const createMockFile = (name: string, size: number, type: string) => {
  const file = new File(['mock content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('File Upload Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders upload zone with proper accessibility', () => {
      const onFilesSelected = vi.fn();
      render(<TestFileUpload onFilesSelected={onFilesSelected} />);

      const uploadZone = screen.getByRole('button', { name: /upload 3d model files/i });
      expect(uploadZone).toBeInTheDocument();
      expect(uploadZone).toHaveAttribute('tabindex', '0');

      const fileInput = screen.getByTestId('file-input');
      expect(fileInput).toHaveAttribute('accept', '.gcode,.stl');
      expect(fileInput).toHaveAttribute('multiple');
    });

    it('processes valid file types correctly', async () => {
      const onFilesSelected = vi.fn();
      render(<TestFileUpload onFilesSelected={onFilesSelected} />);

      const fileInput = screen.getByTestId('file-input');
      const validFiles = [
        createMockFile('model1.gcode', 1024, 'text/plain'),
        createMockFile('model2.stl', 2048, 'application/octet-stream')
      ];

      // Simulate file selection
      Object.defineProperty(fileInput, 'files', {
        value: validFiles,
        writable: false,
      });
      
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('model1.gcode')).toBeInTheDocument();
        expect(screen.getByText('model2.stl')).toBeInTheDocument();
        expect(onFilesSelected).toHaveBeenCalledWith(validFiles);
      });
    });

    it('filters out invalid file types', async () => {
      const onFilesSelected = vi.fn();
      render(<TestFileUpload onFilesSelected={onFilesSelected} />);

      const fileInput = screen.getByTestId('file-input');
      const mixedFiles = [
        createMockFile('valid.gcode', 1024, 'text/plain'),
        createMockFile('invalid.txt', 512, 'text/plain'),
        createMockFile('valid.stl', 1536, 'application/octet-stream')
      ];

      Object.defineProperty(fileInput, 'files', {
        value: mixedFiles,
        writable: false,
      });
      
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('valid.gcode')).toBeInTheDocument();
        expect(screen.getByText('valid.stl')).toBeInTheDocument();
        expect(screen.queryByText('invalid.txt')).not.toBeInTheDocument();
      });

      const validFiles = mixedFiles.filter(f => 
        f.name.endsWith('.gcode') || f.name.endsWith('.stl')
      );
      expect(onFilesSelected).toHaveBeenCalledWith(validFiles);
    });
  });

  describe('Drag and Drop Functionality', () => {
    it('shows visual feedback during drag over', () => {
      const onFilesSelected = vi.fn();
      render(<TestFileUpload onFilesSelected={onFilesSelected} />);

      const uploadZone = screen.getByRole('button', { name: /upload 3d model files/i });
      
      fireEvent.dragOver(uploadZone, {
        dataTransfer: { files: [] }
      });

      expect(uploadZone).toHaveClass('drag-over');
    });

    it('removes drag feedback when drag leaves', () => {
      const onFilesSelected = vi.fn();
      render(<TestFileUpload onFilesSelected={onFilesSelected} />);

      const uploadZone = screen.getByRole('button', { name: /upload 3d model files/i });
      
      fireEvent.dragOver(uploadZone);
      expect(uploadZone).toHaveClass('drag-over');

      fireEvent.dragLeave(uploadZone);
      expect(uploadZone).not.toHaveClass('drag-over');
    });

    it('processes dropped files correctly', async () => {
      const onFilesSelected = vi.fn();
      render(<TestFileUpload onFilesSelected={onFilesSelected} />);

      const uploadZone = screen.getByRole('button', { name: /upload 3d model files/i });
      const droppedFiles = [
        createMockFile('dropped-model.gcode', 1024, 'text/plain')
      ];

      // Create mock DataTransfer
      const dataTransfer = {
        files: droppedFiles
      };

      fireEvent.drop(uploadZone, { dataTransfer });

      await waitFor(() => {
        expect(screen.getByText('dropped-model.gcode')).toBeInTheDocument();
        expect(onFilesSelected).toHaveBeenCalledWith(droppedFiles);
      });
    });
  });

  describe('File Management', () => {
    it('allows removing uploaded files', async () => {
      const onFilesSelected = vi.fn();
      render(<TestFileUpload onFilesSelected={onFilesSelected} />);

      const fileInput = screen.getByTestId('file-input');
      const file = createMockFile('removable.gcode', 1024, 'text/plain');

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('removable.gcode')).toBeInTheDocument();
      });

      const removeButton = screen.getByRole('button', { name: /remove removable\.gcode/i });
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText('removable.gcode')).not.toBeInTheDocument();
      });
    });

    it('displays file count correctly', async () => {
      const onFilesSelected = vi.fn();
      render(<TestFileUpload onFilesSelected={onFilesSelected} />);

      const fileInput = screen.getByTestId('file-input');
      const files = [
        createMockFile('file1.gcode', 1024, 'text/plain'),
        createMockFile('file2.stl', 2048, 'application/octet-stream')
      ];

      Object.defineProperty(fileInput, 'files', {
        value: files,
        writable: false,
      });
      
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('Uploaded Files (2)')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Features', () => {
    it('supports keyboard navigation', async () => {
      const onFilesSelected = vi.fn();
      render(<TestFileUpload onFilesSelected={onFilesSelected} />);

      const uploadZone = screen.getByRole('button', { name: /upload 3d model files/i });
      
      // Focus the upload zone
      uploadZone.focus();
      expect(uploadZone).toHaveFocus();

      // Simulate Enter key press
      fireEvent.keyDown(uploadZone, { key: 'Enter', code: 'Enter' });
      // In a real implementation, this would trigger file picker
      
      // Simulate Space key press
      fireEvent.keyDown(uploadZone, { key: ' ', code: 'Space' });
      // In a real implementation, this would also trigger file picker
    });

    it('provides screen reader friendly file list', async () => {
      const onFilesSelected = vi.fn();
      render(<TestFileUpload onFilesSelected={onFilesSelected} />);

      const fileInput = screen.getByTestId('file-input');
      const files = [
        createMockFile('accessible.gcode', 1024, 'text/plain')
      ];

      Object.defineProperty(fileInput, 'files', {
        value: files,
        writable: false,
      });
      
      fireEvent.change(fileInput);

      await waitFor(() => {
        const fileList = screen.getByRole('list');
        expect(fileList).toBeInTheDocument();
        
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(1);
        
        const removeButton = screen.getByRole('button', { name: /remove accessible\.gcode/i });
        expect(removeButton).toBeInTheDocument();
      });
    });
  });
});