import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import type { AxeResults } from 'axe-core';

// Extend expect matchers
expect.extend(toHaveNoViolations);

// Mock components for testing complex accessibility scenarios
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  const [previousFocus, setPreviousFocus] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setPreviousFocus(document.activeElement as HTMLElement);
      
      // Focus first focusable element in modal
      const modal = document.querySelector('[role="dialog"]');
      const focusableElements = modal?.querySelectorAll(
        'button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements?.length) {
        (focusableElements[0] as HTMLElement).focus();
      }
    } else if (previousFocus) {
      previousFocus.focus();
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, previousFocus]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="modal-content"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="modal-title">{title}</h2>
        {children}
        <button onClick={onClose} aria-label={`Close ${title}`}>
          ✕
        </button>
      </div>
    </div>
  );
};

const FileUploadAccessible = ({ onFilesSelected }: { onFilesSelected: (files: File[]) => void }) => {
  const [dragOver, setDragOver] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dropZoneRef = React.useRef<HTMLDivElement>(null);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div>
      <div
        ref={dropZoneRef}
        role="button"
        tabIndex={0}
        aria-label="Upload 3D model files. Press Enter or Space to browse files, or drag and drop files here."
        aria-describedby="upload-instructions"
        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        onClick={() => fileInputRef.current?.click()}
      >
        <span>Drop files here or click to browse</span>
        <div id="upload-instructions" className="sr-only">
          Supported file types: .gcode and .stl files. Maximum file size: 100MB.
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".gcode,.stl"
        onChange={e => handleFileSelect(Array.from(e.target.files || []))}
        className="sr-only"
        aria-label="Select 3D model files"
      />

      {files.length > 0 && (
        <div role="region" aria-label="Uploaded files">
          <h3>Uploaded Files ({files.length})</h3>
          <ul role="list">
            {files.map((file, index) => (
              <li key={index} role="listitem">
                <div className="file-item">
                  <span>{file.name}</span>
                  <span className="file-size" aria-label={`File size: ${(file.size / 1024).toFixed(1)} KB`}>
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                  <button
                    onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                    aria-label={`Remove ${file.name} from upload queue`}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const PrinterControlPanel = ({ 
  status, 
  temperature, 
  onEmergencyStop,
  onPause,
  onResume 
}: {
  status: 'idle' | 'printing' | 'paused' | 'error';
  temperature: { hotend: number; bed: number };
  onEmergencyStop: () => void;
  onPause: () => void;
  onResume: () => void;
}) => {
  const [showEmergencyConfirm, setShowEmergencyConfirm] = React.useState(false);

  const getStatusAnnouncement = () => {
    switch (status) {
      case 'printing': return 'Printer is currently printing';
      case 'paused': return 'Print job is paused';
      case 'error': return 'Printer error detected';
      default: return 'Printer is idle';
    }
  };

  return (
    <div className="control-panel">
      <div 
        role="status" 
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {getStatusAnnouncement()}
      </div>

      <section aria-labelledby="status-heading">
        <h2 id="status-heading">Printer Status</h2>
        <div className="status-display">
          <div>
            <span>Status: </span>
            <span 
              className={`status-badge ${status}`}
              aria-label={`Printer status: ${status}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
      </section>

      <section aria-labelledby="temperature-heading">
        <h2 id="temperature-heading">Temperature Monitoring</h2>
        <div className="temperature-display">
          <div>
            <label htmlFor="hotend-temp">Hotend Temperature</label>
            <div 
              id="hotend-temp"
              role="meter"
              aria-valuenow={temperature.hotend}
              aria-valuemin={0}
              aria-valuemax={300}
              aria-valuetext={`${temperature.hotend} degrees Celsius`}
            >
              {temperature.hotend}°C
            </div>
          </div>
          <div>
            <label htmlFor="bed-temp">Bed Temperature</label>
            <div 
              id="bed-temp"
              role="meter"
              aria-valuenow={temperature.bed}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={`${temperature.bed} degrees Celsius`}
            >
              {temperature.bed}°C
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="controls-heading">
        <h2 id="controls-heading">Printer Controls</h2>
        <div className="control-buttons">
          {status === 'printing' && (
            <button 
              onClick={onPause}
              aria-describedby="pause-description"
            >
              Pause Print
            </button>
          )}
          
          {status === 'paused' && (
            <button 
              onClick={onResume}
              aria-describedby="resume-description"
            >
              Resume Print
            </button>
          )}

          <button 
            onClick={() => setShowEmergencyConfirm(true)}
            className="emergency-stop"
            disabled={status === 'idle'}
            aria-describedby="emergency-description"
          >
            Emergency Stop
          </button>
        </div>

        <div className="sr-only">
          <div id="pause-description">Temporarily pause the current print job</div>
          <div id="resume-description">Resume the paused print job</div>
          <div id="emergency-description">
            Immediately stop all printer operations. Use only in emergencies.
          </div>
        </div>
      </section>

      <Modal
        isOpen={showEmergencyConfirm}
        onClose={() => setShowEmergencyConfirm(false)}
        title="Confirm Emergency Stop"
      >
        <p>
          Are you sure you want to perform an emergency stop? 
          This will immediately halt all printer operations and may damage your print.
        </p>
        <div className="modal-actions">
          <button 
            onClick={() => {
              onEmergencyStop();
              setShowEmergencyConfirm(false);
            }}
            className="danger"
          >
            Yes, Emergency Stop
          </button>
          <button onClick={() => setShowEmergencyConfirm(false)}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

const DataVisualization = ({ 
  data, 
  title 
}: { 
  data: Array<{ time: string; value: number }>; 
  title: string;
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="chart-container">
      <h3 id={`chart-${title.replace(/\s+/g, '-').toLowerCase()}`}>{title}</h3>
      <div 
        role="img"
        aria-labelledby={`chart-${title.replace(/\s+/g, '-').toLowerCase()}`}
        aria-describedby={`chart-${title.replace(/\s+/g, '-').toLowerCase()}-desc`}
      >
        <svg viewBox="0 0 400 200" className="chart">
          {data.map((point, index) => (
            <rect
              key={index}
              x={index * (400 / data.length)}
              y={200 - (point.value / maxValue) * 180}
              width={400 / data.length - 2}
              height={(point.value / maxValue) * 180}
              fill="currentColor"
              role="presentation"
            />
          ))}
        </svg>
      </div>
      <div 
        id={`chart-${title.replace(/\s+/g, '-').toLowerCase()}-desc`}
        className="sr-only"
      >
        Chart showing {title} over time. 
        Current value: {data[data.length - 1]?.value || 0}. 
        Maximum value: {maxValue}.
        Data points: {data.length}.
      </div>
      
      <table className="sr-only">
        <caption>Data table for {title}</caption>
        <thead>
          <tr>
            <th>Time</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point, index) => (
            <tr key={index}>
              <td>{point.time}</td>
              <td>{point.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

describe('Comprehensive Accessibility Tests', () => {
  beforeEach(() => {
    // Reset any global state
    document.body.innerHTML = '';
  });

  describe('Modal Accessibility', () => {
    it('properly manages focus when modal opens and closes', async () => {
      const user = userEvent.setup();
      let isOpen = false;
      
      const TestModal = () => {
        const [modalOpen, setModalOpen] = React.useState(false);
        isOpen = modalOpen;
        
        return (
          <div>
            <button onClick={() => setModalOpen(true)}>
              Open Modal
            </button>
            <Modal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Test Modal"
            >
              <input type="text" placeholder="First input" />
              <button>Modal Action</button>
            </Modal>
          </div>
        );
      };

      render(<TestModal />);
      
      const openButton = screen.getByRole('button', { name: 'Open Modal' });
      expect(openButton).toHaveFocus(); // Should start with focus
      
      await user.click(openButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Focus should move to first focusable element in modal
      const firstInput = screen.getByPlaceholderText('First input');
      expect(firstInput).toHaveFocus();

      // Escape should close modal and restore focus
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      expect(openButton).toHaveFocus();
    });

    it('traps focus within modal', async () => {
      const user = userEvent.setup();
      
      const TestModal = () => {
        const [modalOpen, setModalOpen] = React.useState(true);
        
        return (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Focus Trap Test"
          >
            <input data-testid="first-input" placeholder="First" />
            <button data-testid="middle-button">Middle</button>
            <input data-testid="last-input" placeholder="Last" />
          </Modal>
        );
      };

      render(<TestModal />);
      
      const dialog = screen.getByRole('dialog');
      const firstInput = screen.getByTestId('first-input');
      const middleButton = screen.getByTestId('middle-button');
      const lastInput = screen.getByTestId('last-input');
      const closeButton = screen.getByRole('button', { name: /close/i });

      expect(dialog).toBeInTheDocument();
      
      // Tab through all elements
      await user.tab();
      expect(middleButton).toHaveFocus();
      
      await user.tab();
      expect(lastInput).toHaveFocus();
      
      await user.tab();
      expect(closeButton).toHaveFocus();
      
      // Tab should wrap to first element
      await user.tab();
      expect(firstInput).toHaveFocus();
      
      // Shift+Tab should go backwards
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(closeButton).toHaveFocus();
    });

    it('has proper ARIA attributes for screen readers', async () => {
      const TestModal = () => {
        return (
          <Modal isOpen={true} onClose={() => {}} title="Accessibility Test">
            <p>Modal content here</p>
          </Modal>
        );
      };

      const { container } = render(<TestModal />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
      
      const title = screen.getByText('Accessibility Test');
      expect(title).toHaveAttribute('id', 'modal-title');

      // Should have no accessibility violations
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('File Upload Accessibility', () => {
    it('supports keyboard navigation for file operations', async () => {
      const user = userEvent.setup();
      const onFilesSelected = vi.fn();
      
      render(<FileUploadAccessible onFilesSelected={onFilesSelected} />);

      const dropZone = screen.getByRole('button', { name: /upload 3d model files/i });
      expect(dropZone).toBeInTheDocument();
      
      // Should be keyboard accessible
      dropZone.focus();
      expect(dropZone).toHaveFocus();
      
      // Space and Enter should trigger file picker
      await user.keyboard(' ');
      // File input is hidden, so we can't easily test the actual file picker opening
      
      await user.keyboard('{Enter}');
      // Same as above - testing the keyboard event handling
    });

    it('provides clear instructions and feedback for screen readers', async () => {
      const onFilesSelected = vi.fn();
      const { container } = render(<FileUploadAccessible onFilesSelected={onFilesSelected} />);

      const dropZone = screen.getByRole('button');
      expect(dropZone).toHaveAttribute('aria-describedby', 'upload-instructions');
      
      const instructions = screen.getByText(/supported file types/i);
      expect(instructions).toHaveAttribute('id', 'upload-instructions');

      // Should have no accessibility violations
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('announces file upload results to screen readers', async () => {
      const user = userEvent.setup();
      const onFilesSelected = vi.fn();
      
      // Create mock files
      const mockFiles = [
        new File(['content'], 'model1.gcode', { type: 'text/plain' }),
        new File(['content'], 'model2.stl', { type: 'application/octet-stream' })
      ];

      render(<FileUploadAccessible onFilesSelected={onFilesSelected} />);

      const fileInput = screen.getByLabelText(/select 3d model files/i);
      
      await user.upload(fileInput, mockFiles);

      await waitFor(() => {
        const filesRegion = screen.getByRole('region', { name: /uploaded files/i });
        expect(filesRegion).toBeInTheDocument();
      });

      const filesList = screen.getByRole('list');
      expect(filesList).toBeInTheDocument();
      
      const fileItems = screen.getAllByRole('listitem');
      expect(fileItems).toHaveLength(2);

      // Each file should have a remove button with descriptive label
      const removeButtons = screen.getAllByRole('button', { name: /remove.*from upload queue/i });
      expect(removeButtons).toHaveLength(2);
    });
  });

  describe('Control Panel Accessibility', () => {
    it('announces status changes to screen readers', async () => {
      const mockHandlers = {
        onEmergencyStop: vi.fn(),
        onPause: vi.fn(),
        onResume: vi.fn()
      };

      const { rerender } = render(
        <PrinterControlPanel
          status="idle"
          temperature={{ hotend: 20, bed: 20 }}
          {...mockHandlers}
        />
      );

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toBeInTheDocument();
      expect(statusRegion).toHaveTextContent(/printer is idle/i);

      // Change status and verify announcement
      rerender(
        <PrinterControlPanel
          status="printing"
          temperature={{ hotend: 200, bed: 60 }}
          {...mockHandlers}
        />
      );

      await waitFor(() => {
        expect(statusRegion).toHaveTextContent(/printer is currently printing/i);
      });

      // Change to error state
      rerender(
        <PrinterControlPanel
          status="error"
          temperature={{ hotend: 200, bed: 60 }}
          {...mockHandlers}
        />
      );

      await waitFor(() => {
        expect(statusRegion).toHaveTextContent(/printer error detected/i);
      });
    });

    it('uses semantic HTML and ARIA for temperature displays', async () => {
      const mockHandlers = {
        onEmergencyStop: vi.fn(),
        onPause: vi.fn(),
        onResume: vi.fn()
      };

      const { container } = render(
        <PrinterControlPanel
          status="printing"
          temperature={{ hotend: 210, bed: 65 }}
          {...mockHandlers}
        />
      );

      const hotendMeter = screen.getByRole('meter', { name: /210 degrees celsius/i });
      expect(hotendMeter).toHaveAttribute('aria-valuenow', '210');
      expect(hotendMeter).toHaveAttribute('aria-valuemin', '0');
      expect(hotendMeter).toHaveAttribute('aria-valuemax', '300');

      const bedMeter = screen.getByRole('meter', { name: /65 degrees celsius/i });
      expect(bedMeter).toHaveAttribute('aria-valuenow', '65');
      expect(bedMeter).toHaveAttribute('aria-valuemin', '0');
      expect(bedMeter).toHaveAttribute('aria-valuemax', '100');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides appropriate button states and descriptions', async () => {
      const user = userEvent.setup();
      const mockHandlers = {
        onEmergencyStop: vi.fn(),
        onPause: vi.fn(),
        onResume: vi.fn()
      };

      render(
        <PrinterControlPanel
          status="idle"
          temperature={{ hotend: 20, bed: 20 }}
          {...mockHandlers}
        />
      );

      const emergencyButton = screen.getByRole('button', { name: /emergency stop/i });
      expect(emergencyButton).toBeDisabled(); // Should be disabled when idle
      expect(emergencyButton).toHaveAttribute('aria-describedby', 'emergency-description');

      // Emergency button should have descriptive text
      expect(screen.getByText(/immediately stop all printer operations/i)).toBeInTheDocument();
    });
  });

  describe('Data Visualization Accessibility', () => {
    it('provides alternative text representation for charts', async () => {
      const temperatureData = [
        { time: '10:00', value: 20 },
        { time: '10:05', value: 150 },
        { time: '10:10', value: 200 },
        { time: '10:15', value: 210 }
      ];

      const { container } = render(
        <DataVisualization 
          data={temperatureData} 
          title="Hotend Temperature" 
        />
      );

      const chart = screen.getByRole('img');
      expect(chart).toHaveAttribute('aria-labelledby', 'chart-hotend-temperature');
      expect(chart).toHaveAttribute('aria-describedby', 'chart-hotend-temperature-desc');

      const description = screen.getByText(/chart showing hotend temperature over time/i);
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent(/current value: 210/i);
      expect(description).toHaveTextContent(/maximum value: 210/i);

      // Should provide data table alternative
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      expect(table).toHaveClass('sr-only'); // Hidden but available to screen readers

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('supports keyboard navigation for interactive charts', async () => {
      const user = userEvent.setup();
      const interactiveData = [
        { time: '10:00', value: 20 },
        { time: '10:05', value: 150 }
      ];

      // Enhanced chart with keyboard interaction
      const InteractiveChart = ({ data }: { data: typeof interactiveData }) => {
        const [selectedPoint, setSelectedPoint] = React.useState<number>(0);

        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'ArrowLeft' && selectedPoint > 0) {
            setSelectedPoint(selectedPoint - 1);
          } else if (e.key === 'ArrowRight' && selectedPoint < data.length - 1) {
            setSelectedPoint(selectedPoint + 1);
          }
        };

        return (
          <div>
            <div 
              role="application"
              tabIndex={0}
              onKeyDown={handleKeyDown}
              aria-label="Interactive temperature chart. Use arrow keys to navigate data points."
            >
              <svg viewBox="0 0 400 200">
                {data.map((point, index) => (
                  <circle
                    key={index}
                    cx={index * 200}
                    cy={200 - point.value}
                    r={index === selectedPoint ? 8 : 4}
                    fill="currentColor"
                    aria-label={`Data point ${index + 1}: ${point.time}, ${point.value}`}
                  />
                ))}
              </svg>
            </div>
            <div aria-live="polite" aria-atomic="true">
              Selected: {data[selectedPoint].time} - {data[selectedPoint].value}°C
            </div>
          </div>
        );
      };

      render(<InteractiveChart data={interactiveData} />);

      const chart = screen.getByRole('application');
      chart.focus();
      expect(chart).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      
      await waitFor(() => {
        expect(screen.getByText(/selected.*10:05.*150/i)).toBeInTheDocument();
      });
    });
  });

  describe('Complex Workflow Accessibility', () => {
    it('maintains accessible navigation through complete printing workflow', async () => {
      const user = userEvent.setup();
      
      const PrintingWorkflow = () => {
        const [step, setStep] = React.useState(1);
        const [files, setFiles] = React.useState<File[]>([]);

        return (
          <div>
            <nav aria-label="Printing workflow steps">
              <ol>
                <li aria-current={step === 1 ? 'step' : undefined}>
                  Upload Files {step === 1 && '(Current)'}
                </li>
                <li aria-current={step === 2 ? 'step' : undefined}>
                  Configure Print {step === 2 && '(Current)'}
                </li>
                <li aria-current={step === 3 ? 'step' : undefined}>
                  Monitor Progress {step === 3 && '(Current)'}
                </li>
              </ol>
            </nav>

            {step === 1 && (
              <section aria-labelledby="upload-heading">
                <h2 id="upload-heading">Step 1: Upload Files</h2>
                <FileUploadAccessible onFilesSelected={setFiles} />
                <button 
                  onClick={() => setStep(2)}
                  disabled={files.length === 0}
                  aria-describedby="next-step-desc"
                >
                  Next: Configure Print
                </button>
                <div id="next-step-desc" className="sr-only">
                  Proceed to configure print settings. Requires at least one uploaded file.
                </div>
              </section>
            )}

            {step === 2 && (
              <section aria-labelledby="config-heading">
                <h2 id="config-heading">Step 2: Configure Print</h2>
                <button onClick={() => setStep(3)}>
                  Next: Start Printing
                </button>
              </section>
            )}

            {step === 3 && (
              <section aria-labelledby="monitor-heading">
                <h2 id="monitor-heading">Step 3: Monitor Progress</h2>
                <PrinterControlPanel
                  status="printing"
                  temperature={{ hotend: 210, bed: 60 }}
                  onEmergencyStop={() => {}}
                  onPause={() => {}}
                  onResume={() => {}}
                />
              </section>
            )}
          </div>
        );
      };

      const { container } = render(<PrintingWorkflow />);

      // Should start on step 1
      expect(screen.getByText(/step 1: upload files/i)).toBeInTheDocument();
      expect(screen.getByText(/upload files.*current/i)).toBeInTheDocument();

      // Should have proper navigation structure
      const navigation = screen.getByRole('navigation', { name: /printing workflow steps/i });
      expect(navigation).toBeInTheDocument();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('handles error states accessibly throughout workflow', async () => {
      const ErrorBoundaryWorkflow = () => {
        const [hasError, setHasError] = React.useState(false);

        if (hasError) {
          return (
            <div role="alert" aria-labelledby="error-heading">
              <h2 id="error-heading">Printing Error Occurred</h2>
              <p>
                An error occurred during the printing process. 
                Please check the printer status and try again.
              </p>
              <button onClick={() => setHasError(false)}>
                Return to Control Panel
              </button>
            </div>
          );
        }

        return (
          <div>
            <button onClick={() => setHasError(true)}>
              Simulate Error
            </button>
          </div>
        );
      };

      const { container } = render(<ErrorBoundaryWorkflow />);

      const simulateButton = screen.getByRole('button', { name: /simulate error/i });
      await userEvent.click(simulateButton);

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveAttribute('aria-labelledby', 'error-heading');
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});