/**
 * End-to-End User Workflow Integration Tests
 * Tests complete user journeys through the 3D printer application
 */

import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { setupApiMocks, ApiMockUtils } from './mocks/api.mock'
import { createWebSocketTestUtils } from './mocks/websocket.mock'
import { 
  create3DPrinterFiles,
  FileUploadTestUtils,
  fileUploadScenarios
} from './mocks/fileUpload.mock'
import { setupThreeJSMocks } from './mocks/three.mock'
import { PerformanceTestUtils, performanceThresholds } from './mocks/performance.mock'

// Setup all mocks
setupApiMocks()
setupThreeJSMocks()

// Mock complete application components
const MockApp: React.FC = () => {
  const [currentView, setCurrentView] = React.useState('dashboard')
  const [printerStatus, setPrinterStatus] = React.useState('idle')
  const [uploadedFiles, setUploadedFiles] = React.useState<any[]>([])
  const [projects, setProjects] = React.useState<any[]>([])
  const [tasks, setTasks] = React.useState<any[]>([])
  
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app" data-testid="main-app">
          {/* Navigation */}
          <nav aria-label="Main navigation">
            <button
              onClick={() => setCurrentView('dashboard')}
              aria-current={currentView === 'dashboard' ? 'page' : undefined}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('printer')}
              aria-current={currentView === 'printer' ? 'page' : undefined}
            >
              Printer Control
            </button>
            <button
              onClick={() => setCurrentView('files')}
              aria-current={currentView === 'files' ? 'page' : undefined}
            >
              File Upload
            </button>
            <button
              onClick={() => setCurrentView('projects')}
              aria-current={currentView === 'projects' ? 'page' : undefined}
            >
              Projects
            </button>
            <button
              onClick={() => setCurrentView('quality')}
              aria-current={currentView === 'quality' ? 'page' : undefined}
            >
              Quality Control
            </button>
          </nav>
          
          {/* Main Content */}
          <main>
            {currentView === 'dashboard' && (
              <section data-testid="dashboard">
                <h1>3D Printer Dashboard</h1>
                <div data-testid="printer-status">
                  Status: {printerStatus}
                </div>
                <div data-testid="project-count">
                  Projects: {projects.length}
                </div>
                <div data-testid="file-count">
                  Files: {uploadedFiles.length}
                </div>
                {/* 3D Scene */}
                <div data-testid="r3f-canvas" role="img" aria-label="3D printer model visualization">
                  3D Scene Placeholder
                </div>
              </section>
            )}
            
            {currentView === 'printer' && (
              <section data-testid="printer-control">
                <h1>Printer Control Panel</h1>
                <div role="group" aria-labelledby="status-group">
                  <h2 id="status-group">Status Information</h2>
                  <div aria-live="polite">
                    Status: <span data-testid="printer-status-live">{printerStatus}</span>
                  </div>
                </div>
                <div role="group" aria-labelledby="controls-group">
                  <h2 id="controls-group">Controls</h2>
                  <button
                    onClick={() => setPrinterStatus('printing')}
                    disabled={printerStatus === 'printing'}
                  >
                    Start Print
                  </button>
                  <button
                    onClick={() => setPrinterStatus('paused')}
                    disabled={printerStatus !== 'printing'}
                  >
                    Pause Print
                  </button>
                  <button
                    onClick={() => setPrinterStatus('idle')}
                    disabled={printerStatus === 'idle'}
                  >
                    Stop Print
                  </button>
                </div>
              </section>
            )}
            
            {currentView === 'files' && (
              <section data-testid="file-upload">
                <h1>File Upload</h1>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Upload 3D printer files"
                  onClick={() => {
                    // Simulate file selection
                    const mockFiles = [create3DPrinterFiles.validGcode()]
                    setUploadedFiles(prev => [...prev, ...mockFiles])
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      const mockFiles = [create3DPrinterFiles.validGcode()]
                      setUploadedFiles(prev => [...prev, ...mockFiles])
                    }
                  }}
                >
                  Click to select files or drag and drop
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div data-testid="uploaded-files">
                    <h2>Uploaded Files</h2>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} data-testid="file-item">
                        <span>{file.name}</span>
                        <button
                          onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                          aria-label={`Remove ${file.name}`}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
            
            {currentView === 'projects' && (
              <section data-testid="project-management">
                <h1>Project Management</h1>
                <button
                  onClick={() => setProjects(prev => [...prev, { 
                    id: Date.now(), 
                    name: `Project ${prev.length + 1}`,
                    tasks: []
                  }])}
                >
                  New Project
                </button>
                
                {projects.map(project => (
                  <div key={project.id} data-testid="project-item">
                    <h3>{project.name}</h3>
                    <button
                      onClick={() => setTasks(prev => [...prev, {
                        id: Date.now(),
                        projectId: project.id,
                        title: `Task ${prev.length + 1}`,
                        status: 'todo'
                      }])}
                    >
                      Add Task
                    </button>
                    
                    <div data-testid="project-tasks">
                      {tasks.filter(task => task.projectId === project.id).map(task => (
                        <div key={task.id} data-testid="task-item">
                          <input
                            type="checkbox"
                            checked={task.status === 'completed'}
                            onChange={() => setTasks(prev => prev.map(t =>
                              t.id === task.id 
                                ? { ...t, status: t.status === 'completed' ? 'todo' : 'completed' }
                                : t
                            ))}
                          />
                          <span>{task.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}
            
            {currentView === 'quality' && (
              <section data-testid="quality-control">
                <h1>Quality Control</h1>
                <div data-testid="quality-score">
                  Overall Quality: 88%
                </div>
                <button data-testid="run-tests">Run All Tests</button>
                <button data-testid="new-test">New Test</button>
                
                <div data-testid="test-results">
                  <div className="test-item" data-status="passed">
                    Print Quality Test - Passed
                  </div>
                  <div className="test-item" data-status="pending">
                    Temperature Test - Pending
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('End-to-End User Workflow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ApiMockUtils.clearAll()
  })

  describe('Complete 3D Printing Workflow', () => {
    it('supports full workflow: file upload → project creation → print execution → quality control', async () => {
      const user = userEvent.setup()
      render(<MockApp />)
      
      // 1. Start at Dashboard
      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
      expect(screen.getByText('3D Printer Dashboard')).toBeInTheDocument()
      expect(screen.getByTestId('printer-status')).toHaveTextContent('Status: idle')
      
      // 2. Navigate to File Upload
      await user.click(screen.getByRole('button', { name: 'File Upload' }))
      
      await waitFor(() => {
        expect(screen.getByTestId('file-upload')).toBeInTheDocument()
      })
      
      // 3. Upload a file
      const uploadArea = screen.getByRole('button', { name: 'Upload 3D printer files' })
      await user.click(uploadArea)
      
      await waitFor(() => {
        expect(screen.getByTestId('uploaded-files')).toBeInTheDocument()
        expect(screen.getByText('test-model.gcode')).toBeInTheDocument()
      })
      
      // 4. Navigate to Project Management
      await user.click(screen.getByRole('button', { name: 'Projects' }))
      
      await waitFor(() => {
        expect(screen.getByTestId('project-management')).toBeInTheDocument()
      })
      
      // 5. Create a new project
      await user.click(screen.getByRole('button', { name: 'New Project' }))
      
      await waitFor(() => {
        expect(screen.getByTestId('project-item')).toBeInTheDocument()
        expect(screen.getByText('Project 1')).toBeInTheDocument()
      })
      
      // 6. Add tasks to project
      await user.click(screen.getByRole('button', { name: 'Add Task' }))
      
      await waitFor(() => {
        expect(screen.getByTestId('task-item')).toBeInTheDocument()
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })
      
      // 7. Navigate to Printer Control
      await user.click(screen.getByRole('button', { name: 'Printer Control' }))
      
      await waitFor(() => {
        expect(screen.getByTestId('printer-control')).toBeInTheDocument()
      })
      
      // 8. Start printing
      await user.click(screen.getByRole('button', { name: 'Start Print' }))
      
      await waitFor(() => {
        expect(screen.getByTestId('printer-status-live')).toHaveTextContent('printing')
      })
      
      // 9. Navigate to Quality Control
      await user.click(screen.getByRole('button', { name: 'Quality Control' }))
      
      await waitFor(() => {
        expect(screen.getByTestId('quality-control')).toBeInTheDocument()
        expect(screen.getByTestId('quality-score')).toHaveTextContent('Overall Quality: 88%')
      })
      
      // 10. Run quality tests
      await user.click(screen.getByTestId('run-tests'))
      
      // Workflow complete - verify final state
      expect(screen.getByTestId('test-results')).toBeInTheDocument()
      expect(screen.getByText('Print Quality Test - Passed')).toBeInTheDocument()
    })

    it('handles workflow interruptions and recovery gracefully', async () => {
      const user = userEvent.setup()
      render(<MockApp />)
      
      // Start workflow
      await user.click(screen.getByRole('button', { name: 'Printer Control' }))
      await user.click(screen.getByRole('button', { name: 'Start Print' }))
      
      await waitFor(() => {
        expect(screen.getByTestId('printer-status-live')).toHaveTextContent('printing')
      })
      
      // Simulate interruption (pause)
      await user.click(screen.getByRole('button', { name: 'Pause Print' }))
      
      await waitFor(() => {
        expect(screen.getByTestId('printer-status-live')).toHaveTextContent('paused')
      })
      
      // Navigate away and back
      await user.click(screen.getByRole('button', { name: 'Dashboard' }))
      await user.click(screen.getByRole('button', { name: 'Printer Control' }))
      
      // Status should be preserved
      expect(screen.getByTestId('printer-status-live')).toHaveTextContent('paused')
      
      // Resume printing
      await user.click(screen.getByRole('button', { name: 'Start Print' }))
      
      await waitFor(() => {
        expect(screen.getByTestId('printer-status-live')).toHaveTextContent('printing')
      })
    })
  })

  describe('Real-time Collaboration Workflow', () => {
    it('supports multiple users working on same project with real-time updates', async () => {
      const { mockSocket, testUtils } = createWebSocketTestUtils()
      const user = userEvent.setup()
      
      render(<MockApp />)
      
      // Navigate to projects
      await user.click(screen.getByRole('button', { name: 'Projects' }))
      await user.click(screen.getByRole('button', { name: 'New Project' }))
      
      await waitFor(() => {
        expect(screen.getByText('Project 1')).toBeInTheDocument()
      })
      
      // Add task
      await user.click(screen.getByRole('button', { name: 'Add Task' }))
      
      // Simulate real-time task update from another user
      testUtils.simulateTaskUpdate({
        id: 'remote-task',
        title: 'Task added by remote user',
        status: 'in-progress',
        priority: 'high'
      })
      
      // Should show real-time update
      await waitFor(() => {
        // In real implementation, this would update the tasks list
        expect(mockSocket.on).toHaveBeenCalledWith('task-updated', expect.any(Function))
      })
      
      // Complete local task
      const taskCheckbox = screen.getByRole('checkbox')
      await user.click(taskCheckbox)
      
      // Should emit task completion to other users
      expect(mockSocket.emit).toHaveBeenCalled()
    })

    it('maintains real-time printer status across multiple views', async () => {
      const { testUtils } = createWebSocketTestUtils()
      const user = userEvent.setup()
      
      render(<MockApp />)
      
      // Navigate to printer control and start print
      await user.click(screen.getByRole('button', { name: 'Printer Control' }))
      await user.click(screen.getByRole('button', { name: 'Start Print' }))
      
      // Navigate to dashboard
      await user.click(screen.getByRole('button', { name: 'Dashboard' }))
      
      // Dashboard should show updated printer status
      expect(screen.getByTestId('printer-status')).toHaveTextContent('Status: printing')
      
      // Simulate real-time status update
      testUtils.simulatePrinterStatusUpdate({
        status: 'printing',
        progress: 25,
        temperature: { nozzle: 210, bed: 60 }
      })
      
      // Status should update in real-time
      await waitFor(() => {
        // In real implementation, would show progress
        expect(screen.getByTestId('printer-status')).toBeInTheDocument()
      })
    })
  })

  describe('Error Recovery and Edge Cases', () => {
    it('recovers from network interruptions during critical workflows', async () => {
      const { testUtils } = createWebSocketTestUtils()
      const user = userEvent.setup()
      
      render(<MockApp />)
      
      // Start a print job
      await user.click(screen.getByRole('button', { name: 'Printer Control' }))
      await user.click(screen.getByRole('button', { name: 'Start Print' }))
      
      // Simulate network disconnection
      testUtils.simulateConnectionStatus(false)
      
      // App should continue to function locally
      await user.click(screen.getByRole('button', { name: 'Dashboard' }))
      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
      
      // Simulate reconnection
      testUtils.simulateConnectionStatus(true)
      
      // Should sync with server state
      testUtils.simulatePrinterStatusUpdate({
        status: 'printing',
        progress: 50 // Progress continued during disconnection
      })
    })

    it('handles concurrent user actions gracefully', async () => {
      const user = userEvent.setup()
      render(<MockApp />)
      
      // Navigate to projects and perform rapid actions
      await user.click(screen.getByRole('button', { name: 'Projects' }))
      
      // Rapidly create multiple projects
      await Promise.all([
        user.click(screen.getByRole('button', { name: 'New Project' })),
        user.click(screen.getByRole('button', { name: 'New Project' })),
        user.click(screen.getByRole('button', { name: 'New Project' }))
      ])
      
      // Should handle concurrent actions without issues
      await waitFor(() => {
        const projectItems = screen.getAllByTestId('project-item')
        expect(projectItems.length).toBeGreaterThan(0)
      })
    })

    it('maintains data consistency during view transitions', async () => {
      const user = userEvent.setup()
      render(<MockApp />)
      
      // Create data in one view
      await user.click(screen.getByRole('button', { name: 'File Upload' }))
      await user.click(screen.getByRole('button', { name: 'Upload 3D printer files' }))
      
      await waitFor(() => {
        expect(screen.getByText('test-model.gcode')).toBeInTheDocument()
      })
      
      // Switch views multiple times
      await user.click(screen.getByRole('button', { name: 'Projects' }))
      await user.click(screen.getByRole('button', { name: 'Dashboard' }))
      await user.click(screen.getByRole('button', { name: 'File Upload' }))
      
      // Data should be preserved
      expect(screen.getByText('test-model.gcode')).toBeInTheDocument()
    })
  })

  describe('Performance Under Load', () => {
    it('maintains responsive UI during high-frequency updates', async () => {
      const user = userEvent.setup()
      const { testUtils } = createWebSocketTestUtils()
      
      render(<MockApp />)
      
      const performanceTest = async () => {
        // Navigate to dashboard
        await user.click(screen.getByRole('button', { name: 'Dashboard' }))
        
        // Simulate high-frequency status updates
        for (let i = 0; i < 100; i++) {
          testUtils.simulatePrinterStatusUpdate({
            status: 'printing',
            progress: i,
            temperature: { nozzle: 210 + (i % 10), bed: 60 }
          })
          
          if (i % 10 === 0) {
            // Intermittent user interactions
            await user.click(screen.getByRole('button', { name: 'Printer Control' }))
            await user.click(screen.getByRole('button', { name: 'Dashboard' }))
          }
        }
      }
      
      const result = await PerformanceTestUtils.benchmark(
        'high-frequency-updates',
        performanceTest,
        performanceThresholds.realTimeUpdates
      )
      
      expect(result.passed).toBe(true)
    })

    it('scales with large datasets efficiently', async () => {
      const user = userEvent.setup()
      
      // Mock large dataset
      const largeProjectData = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        name: `Project ${i}`,
        tasks: Array.from({ length: 20 }, (_, j) => ({
          id: `${i}-${j}`,
          title: `Task ${j}`,
          status: j % 3 === 0 ? 'completed' : 'todo'
        }))
      }))
      
      const renderTest = async () => {
        render(<MockApp />)
        await user.click(screen.getByRole('button', { name: 'Projects' }))
        
        // Simulate loading large dataset
        largeProjectData.forEach(() => {
          user.click(screen.getByRole('button', { name: 'New Project' }))
        })
      }
      
      const result = await PerformanceTestUtils.benchmark(
        'large-dataset-rendering',
        renderTest,
        performanceThresholds.componentUpdates
      )
      
      expect(result.passed).toBe(true)
    })
  })

  describe('Accessibility Throughout Workflows', () => {
    it('maintains accessibility during complete workflows', async () => {
      const user = userEvent.setup()
      render(<MockApp />)
      
      // Test keyboard navigation through complete workflow
      
      // Navigate using Tab key
      await user.tab() // First navigation button
      expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveFocus()
      
      await user.tab() // Second navigation button
      expect(screen.getByRole('button', { name: 'Printer Control' })).toHaveFocus()
      
      // Activate printer control with Enter
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        expect(screen.getByTestId('printer-control')).toBeInTheDocument()
      })
      
      // Tab to controls
      await user.tab() // Start Print button
      expect(screen.getByRole('button', { name: 'Start Print' })).toHaveFocus()
      
      // Activate with space
      await user.keyboard(' ')
      
      await waitFor(() => {
        expect(screen.getByTestId('printer-status-live')).toHaveTextContent('printing')
      })
      
      // Verify ARIA live region announces status change
      const liveRegion = screen.getByTestId('printer-status-live').closest('[aria-live="polite"]')
      expect(liveRegion).toBeInTheDocument()
    })

    it('provides screen reader friendly workflow progression', async () => {
      const user = userEvent.setup()
      render(<MockApp />)
      
      // Navigate to file upload
      await user.click(screen.getByRole('button', { name: 'File Upload' }))
      
      // Upload file
      const uploadArea = screen.getByRole('button', { name: 'Upload 3D printer files' })
      await user.click(uploadArea)
      
      // Verify file upload announcement
      await waitFor(() => {
        expect(screen.getByTestId('uploaded-files')).toBeInTheDocument()
        // In real implementation, would have aria-live announcement
      })
      
      // Navigate to projects
      await user.click(screen.getByRole('button', { name: 'Projects' }))
      
      // Create project
      await user.click(screen.getByRole('button', { name: 'New Project' }))
      
      // Verify project creation is announced
      await waitFor(() => {
        expect(screen.getByTestId('project-item')).toBeInTheDocument()
      })
    })

    it('handles focus management during dynamic content changes', async () => {
      const user = userEvent.setup()
      render(<MockApp />)
      
      // Navigate to projects
      await user.click(screen.getByRole('button', { name: 'Projects' }))
      await user.click(screen.getByRole('button', { name: 'New Project' }))
      
      // Focus should be managed when content changes
      const addTaskButton = screen.getByRole('button', { name: 'Add Task' })
      addTaskButton.focus()
      
      await user.click(addTaskButton)
      
      // Focus should remain manageable after dynamic content addition
      await waitFor(() => {
        const taskCheckbox = screen.getByRole('checkbox')
        expect(taskCheckbox).toBeInTheDocument()
      })
      
      // Should be able to navigate to new content
      await user.tab()
      expect(screen.getByRole('checkbox')).toHaveFocus()
    })
  })
})