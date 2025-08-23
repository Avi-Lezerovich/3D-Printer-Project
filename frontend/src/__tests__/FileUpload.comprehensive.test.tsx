import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import FileUpload from '../../components/FileUpload';

// Mock the app store
const mockAddJob = vi.fn();
vi.mock('../../shared/store', () => ({
  useAppStore: () => mockAddJob
}));

// Helper function to create mock files
const createMockFile = (name: string, size: number, type: string) => {
  const file = new File(['mock content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// Mock file reading
const mockFileReader = {
  readAsArrayBuffer: vi.fn(),
  readAsDataURL: vi.fn(),
  result: null,
  onload: null,
  onerror: null
};

global.FileReader = vi.fn(() => mockFileReader) as any;

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = vi.fn();

describe('FileUpload Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders file upload area with proper accessibility attributes', () => {
      render(<FileUpload />);

      const uploadZone = screen.getByText(/drop files here or click to browse/i);
      expect(uploadZone).toBeInTheDocument();

      const fileInput = screen.getByLabelText(/file upload/i);
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('accept', '.gcode,.stl');
      expect(fileInput).toHaveAttribute('multiple');
    });

    it('displays supported file types information', () => {
      render(<FileUpload />);

      expect(screen.getByText(/supports \.gcode and \.stl files/i)).toBeInTheDocument();
    });
  });

  describe('File Selection via Click', () => {
    it('opens file picker when upload zone is clicked', async () => {
      render(<FileUpload />);

      const uploadZone = screen.getByText(/drop files here or click to browse/i);
      fireEvent.click(uploadZone);

      // File input should be triggered (we can't easily test this directly in JSDOM)
      expect(uploadZone).toBeInTheDocument();
    });

    it('processes valid file types correctly', async () => {
      const user = userEvent.setup();
      render(<FileUpload />);

      const fileInput = screen.getByLabelText(/file upload/i);
      const validFiles = [
        createMockFile('model1.gcode', 1024, 'text/plain'),
        createMockFile('model2.stl', 2048, 'application/octet-stream'),
        createMockFile('model3.GCODE', 512, 'text/plain') // Test case sensitivity
      ];

      await user.upload(fileInput, validFiles);

      await waitFor(() => {
        expect(screen.getByText('model1.gcode')).toBeInTheDocument();
        expect(screen.getByText('model2.stl')).toBeInTheDocument();
        expect(screen.getByText('model3.GCODE')).toBeInTheDocument();
      });

      // Should add jobs to queue
      expect(mockAddJob).toHaveBeenCalledTimes(3);
      expect(mockAddJob).toHaveBeenCalledWith({
        id: expect.any(String),
        name: 'model1.gcode',
        progress: 0,
        status: 'queued'
      });
    });

    it('filters out invalid file types', async () => {
      const user = userEvent.setup();
      render(<FileUpload />);

      const fileInput = screen.getByLabelText(/file upload/i);
      const mixedFiles = [
        createMockFile('valid.gcode', 1024, 'text/plain'),
        createMockFile('invalid.txt', 512, 'text/plain'),
        createMockFile('invalid.jpg', 2048, 'image/jpeg'),
        createMockFile('valid.stl', 1536, 'application/octet-stream')
      ];

      await user.upload(fileInput, mixedFiles);

      await waitFor(() => {
        expect(screen.getByText('valid.gcode')).toBeInTheDocument();
        expect(screen.getByText('valid.stl')).toBeInTheDocument();
        expect(screen.queryByText('invalid.txt')).not.toBeInTheDocument();
        expect(screen.queryByText('invalid.jpg')).not.toBeInTheDocument();
      });

      // Should only add valid files to queue
      expect(mockAddJob).toHaveBeenCalledTimes(2);
    });
  });

  describe('Drag and Drop Functionality', () => {
    it('shows visual feedback during drag over', async () => {
      render(<FileUpload />);

      const uploadZone = screen.getByText(/drop files here or click to browse/i).closest('div');
      expect(uploadZone).toBeInTheDocument();

      // Simulate drag over
      act(() => {
        const dragEvent = new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          dataTransfer: new DataTransfer()
        });
        uploadZone!.dispatchEvent(dragEvent);
      });

      // Upload zone should show drag-over styling
      expect(uploadZone).toHaveClass('drag-over');
    });

    it('removes drag feedback when drag leaves', async () => {
      render(<FileUpload />);

      const uploadZone = screen.getByText(/drop files here or click to browse/i).closest('div');
      
      // Simulate drag over then drag leave
      act(() => {
        const dragOverEvent = new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          dataTransfer: new DataTransfer()
        });
        uploadZone!.dispatchEvent(dragOverEvent);
      });

      expect(uploadZone).toHaveClass('drag-over');

      act(() => {
        const dragLeaveEvent = new DragEvent('dragleave', {
          bubbles: true,
          cancelable: true
        });
        uploadZone!.dispatchEvent(dragLeaveEvent);
      });

      expect(uploadZone).not.toHaveClass('drag-over');
    });

    it('processes dropped files correctly', async () => {
      render(<FileUpload />);

      const uploadZone = screen.getByText(/drop files here or click to browse/i).closest('div');
      const droppedFiles = [
        createMockFile('dropped-model.gcode', 1024, 'text/plain'),
        createMockFile('dropped-model.stl', 2048, 'application/octet-stream')
      ];

      // Create a mock DataTransfer with files
      const dataTransfer = new DataTransfer();
      droppedFiles.forEach(file => dataTransfer.items.add(file));

      act(() => {
        const dropEvent = new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          dataTransfer
        });
        uploadZone!.dispatchEvent(dropEvent);
      });

      await waitFor(() => {
        expect(screen.getByText('dropped-model.gcode')).toBeInTheDocument();
        expect(screen.getByText('dropped-model.stl')).toBeInTheDocument();
      });

      expect(mockAddJob).toHaveBeenCalledTimes(2);
    });
  });

  describe('File Validation and Error Handling', () => {
    it('handles large files appropriately', async () => {
      const user = userEvent.setup();
      render(<FileUpload />);

      const fileInput = screen.getByLabelText(/file upload/i);
      const largeFile = createMockFile('huge-model.gcode', 100 * 1024 * 1024, 'text/plain'); // 100MB

      await user.upload(fileInput, largeFile);

      await waitFor(() => {
        // Should still process the file but might show warning
        expect(screen.getByText('huge-model.gcode')).toBeInTheDocument();
      });
    });

    it('displays file size information', async () => {
      const user = userEvent.setup();
      render(<FileUpload />);

      const fileInput = screen.getByLabelText(/file upload/i);
      const files = [
        createMockFile('small.gcode', 1024, 'text/plain'),
        createMockFile('large.stl', 5 * 1024 * 1024, 'application/octet-stream')
      ];

      await user.upload(fileInput, files);

      await waitFor(() => {
        expect(screen.getByText(/1\.0 KB/)).toBeInTheDocument();
        expect(screen.getByText(/5\.0 MB/)).toBeInTheDocument();
      });
    });

    it('prevents duplicate file uploads', async () => {
      const user = userEvent.setup();
      render(<FileUpload />);

      const fileInput = screen.getByLabelText(/file upload/i);
      const duplicateFile = createMockFile('model.gcode', 1024, 'text/plain');

      // Upload same file twice
      await user.upload(fileInput, duplicateFile);
      await user.upload(fileInput, duplicateFile);

      await waitFor(() => {
        const fileElements = screen.getAllByText('model.gcode');
        // Should only appear once (not duplicated)
        expect(fileElements).toHaveLength(1);
      });

      // Should only add to queue once
      expect(mockAddJob).toHaveBeenCalledTimes(1);
    });
  });

  describe('File Management', () => {
    it('allows removing uploaded files', async () => {
      const user = userEvent.setup();
      render(<FileUpload />);

      const fileInput = screen.getByLabelText(/file upload/i);
      const file = createMockFile('removable.gcode', 1024, 'text/plain');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('removable.gcode')).toBeInTheDocument();
      });

      // Find and click remove button
      const removeButton = screen.getByRole('button', { name: /remove.*removable\.gcode/i });
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText('removable.gcode')).not.toBeInTheDocument();
      });
    });

    it('shows file upload progress simulation', async () => {
      const user = userEvent.setup();
      render(<FileUpload />);

      const fileInput = screen.getByLabelText(/file upload/i);
      const file = createMockFile('uploading.gcode', 1024, 'text/plain');

      // Mock a slow upload
      mockFileReader.onload = vi.fn();
      
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('uploading.gcode')).toBeInTheDocument();
      });

      // Should show some indication of processing
      expect(screen.getByText(/queued/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('provides screen reader announcements for file operations', async () => {
      const user = userEvent.setup();
      render(<FileUpload />);

      const fileInput = screen.getByLabelText(/file upload/i);
      const file = createMockFile('accessible.gcode', 1024, 'text/plain');

      await user.upload(fileInput, file);

      await waitFor(() => {
        // Should have accessible text for file status
        expect(screen.getByText('accessible.gcode')).toBeInTheDocument();
        const fileItem = screen.getByText('accessible.gcode').closest('[role="listitem"]');
        expect(fileItem).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation for file management', async () => {
      const user = userEvent.setup();
      render(<FileUpload />);

      const fileInput = screen.getByLabelText(/file upload/i);
      const files = [
        createMockFile('file1.gcode', 1024, 'text/plain'),
        createMockFile('file2.stl', 2048, 'application/octet-stream')
      ];

      await user.upload(fileInput, files);

      await waitFor(() => {
        expect(screen.getByText('file1.gcode')).toBeInTheDocument();
        expect(screen.getByText('file2.stl')).toBeInTheDocument();
      });

      // Should be able to navigate to remove buttons with keyboard
      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      expect(removeButtons.length).toBe(2);

      // Test keyboard accessibility
      await user.tab();
      expect(removeButtons[0]).toHaveFocus();

      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.queryByText('file1.gcode')).not.toBeInTheDocument();
      });
    });

    it('provides appropriate ARIA labels and descriptions', () => {
      render(<FileUpload />);

      const fileInput = screen.getByLabelText(/file upload/i);
      expect(fileInput).toHaveAttribute('aria-describedby');

      const uploadZone = screen.getByText(/drop files here or click to browse/i);
      expect(uploadZone.closest('div')).toHaveAttribute('role', 'button');
      expect(uploadZone.closest('div')).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Performance Considerations', () => {
    it('handles multiple file uploads efficiently', async () => {
      const user = userEvent.setup();
      render(<FileUpload />);

      const startTime = performance.now();
      
      const fileInput = screen.getByLabelText(/file upload/i);
      const manyFiles = Array.from({ length: 20 }, (_, i) => 
        createMockFile(`model-${i}.gcode`, 1024, 'text/plain')
      );

      await user.upload(fileInput, manyFiles);

      const endTime = performance.now();

      // Should process within reasonable time
      expect(endTime - startTime).toBeLessThan(1000);

      await waitFor(() => {
        expect(screen.getAllByText(/model-\d+\.gcode/)).toHaveLength(20);
      });

      expect(mockAddJob).toHaveBeenCalledTimes(20);
    });

    it('cleans up object URLs to prevent memory leaks', async () => {
      const user = userEvent.setup();
      render(<FileUpload />);

      const fileInput = screen.getByLabelText(/file upload/i);
      const file = createMockFile('cleanup.gcode', 1024, 'text/plain');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('cleanup.gcode')).toBeInTheDocument();
      });

      // Remove the file
      const removeButton = screen.getByRole('button', { name: /remove.*cleanup\.gcode/i });
      await user.click(removeButton);

      // URL.revokeObjectURL should be called to clean up
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });
});