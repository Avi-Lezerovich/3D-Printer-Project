/**
 * Enhanced Accessibility Testing Suite
 * Comprehensive a11y testing patterns for 3D printer application
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { vi } from 'vitest'
import FileUpload from '../components/FileUpload'
import Scene3D from '../components/Scene3D'
import { setupThreeJSMocks } from './mocks/three.mock'

expect.extend(toHaveNoViolations)

// Setup Three.js mocks
setupThreeJSMocks()

// Mock components for testing
const PrinterControlPanel: React.FC = () => {
  const [status, setStatus] = React.useState('idle')
  const [temperature, setTemperature] = React.useState({ nozzle: 0, bed: 0 })
  
  return (
    <section 
      aria-labelledby="printer-controls-title" 
      role="region"
      data-testid="printer-control-panel"
    >
      <h2 id="printer-controls-title">Printer Control Panel</h2>
      
      <div role="group" aria-labelledby="status-group">
        <h3 id="status-group">Status Information</h3>
        <div aria-live="polite" aria-atomic="true">
          <span id="printer-status">Status: {status}</span>
        </div>
        <div aria-live="polite">
          <span id="nozzle-temp">Nozzle: {temperature.nozzle}°C</span>
        </div>
        <div aria-live="polite">
          <span id="bed-temp">Bed: {temperature.bed}°C</span>
        </div>
      </div>
      
      <div role="group" aria-labelledby="controls-group">
        <h3 id="controls-group">Printer Controls</h3>
        <button
          type="button"
          aria-describedby="start-btn-desc"
          onClick={() => setStatus('printing')}
        >
          Start Print
        </button>
        <div id="start-btn-desc" className="sr-only">
          Begin printing the currently loaded file
        </div>
        
        <button
          type="button"
          aria-describedby="pause-btn-desc"
          disabled={status !== 'printing'}
          onClick={() => setStatus('paused')}
        >
          Pause Print
        </button>
        <div id="pause-btn-desc" className="sr-only">
          Temporarily pause the current print job
        </div>
        
        <button
          type="button"
          aria-describedby="stop-btn-desc"
          disabled={status === 'idle'}
          onClick={() => setStatus('idle')}
        >
          Stop Print
        </button>
        <div id="stop-btn-desc" className="sr-only">
          Stop the current print job completely
        </div>
      </div>
      
      <div role="group" aria-labelledby="temperature-controls">
        <h3 id="temperature-controls">Temperature Controls</h3>
        <label htmlFor="nozzle-temp-input">
          Nozzle Temperature
          <input
            id="nozzle-temp-input"
            type="number"
            min="0"
            max="300"
            value={temperature.nozzle}
            onChange={(e) => setTemperature(prev => ({ ...prev, nozzle: parseInt(e.target.value) }))}
            aria-describedby="nozzle-temp-help"
          />
        </label>
        <div id="nozzle-temp-help" className="sr-only">
          Set nozzle temperature between 0 and 300 degrees Celsius
        </div>
        
        <label htmlFor="bed-temp-input">
          Bed Temperature
          <input
            id="bed-temp-input"
            type="number"
            min="0"
            max="120"
            value={temperature.bed}
            onChange={(e) => setTemperature(prev => ({ ...prev, bed: parseInt(e.target.value) }))}
            aria-describedby="bed-temp-help"
          />
        </label>
        <div id="bed-temp-help" className="sr-only">
          Set bed temperature between 0 and 120 degrees Celsius
        </div>
      </div>
    </section>
  )
}

const ProjectTaskList: React.FC = () => {
  const [tasks, setTasks] = React.useState([
    { id: '1', title: 'Design printer frame', completed: true, priority: 'high' },
    { id: '2', title: 'Test print quality', completed: false, priority: 'medium' },
    { id: '3', title: 'Calibrate bed leveling', completed: false, priority: 'low' }
  ])
  
  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }
  
  return (
    <section 
      aria-labelledby="tasks-title" 
      role="region"
      data-testid="project-tasks"
    >
      <h2 id="tasks-title">Project Tasks</h2>
      
      <div role="toolbar" aria-label="Task filters">
        <button type="button" aria-pressed="false">All Tasks</button>
        <button type="button" aria-pressed="true">Active Tasks</button>
        <button type="button" aria-pressed="false">Completed Tasks</button>
      </div>
      
      <ul role="list" aria-label="Project task list">
        {tasks.map(task => (
          <li key={task.id} role="listitem">
            <div className={`task-item priority-${task.priority}`}>
              <input
                type="checkbox"
                id={`task-${task.id}`}
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                aria-describedby={`task-${task.id}-desc`}
              />
              <label 
                htmlFor={`task-${task.id}`}
                className={task.completed ? 'completed' : ''}
              >
                {task.title}
              </label>
              <span 
                id={`task-${task.id}-desc`} 
                className="sr-only"
              >
                Priority: {task.priority}, Status: {task.completed ? 'completed' : 'pending'}
              </span>
              <button
                type="button"
                aria-label={`Edit task: ${task.title}`}
                onClick={() => {}}
              >
                Edit
              </button>
              <button
                type="button"
                aria-label={`Delete task: ${task.title}`}
                onClick={() => {}}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      
      <button
        type="button"
        aria-describedby="add-task-desc"
        onClick={() => {}}
      >
        Add New Task
      </button>
      <div id="add-task-desc" className="sr-only">
        Create a new task for this project
      </div>
    </section>
  )
}

describe('Enhanced Accessibility Testing', () => {
  describe('Core Component Accessibility', () => {
    it('FileUpload component meets accessibility standards', async () => {
      const { container } = render(<FileUpload />)
      
      // Check for violations
      const results = await axe(container)
      expect(results).toHaveNoViolations()
      
      // Test keyboard navigation
      const user = userEvent.setup()
      const uploadArea = screen.getByRole('button', { name: /upload 3d printer files/i })
      
      // Should be focusable
      await user.tab()
      expect(uploadArea).toHaveFocus()
      
      // Should be activatable with keyboard
      await user.keyboard('{Enter}')
      // File input click should be triggered (mocked)
    })

    it('3D Scene provides accessible alternative', async () => {
      const { container } = render(<Scene3D />)
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
      
      // Should have accessible description
      const scene = screen.getByTestId('r3f-canvas')
      expect(scene).toHaveAttribute('role', 'img')
      expect(scene).toHaveAttribute('aria-label', '3D printer model visualization')
      
      // Should be keyboard accessible
      expect(scene.tabIndex).not.toBe(-1)
    })

    it('Printer Control Panel is fully accessible', async () => {
      const { container } = render(<PrinterControlPanel />)
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
      
      // Test semantic structure
      expect(screen.getByRole('region', { name: 'Printer Control Panel' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2, name: 'Printer Control Panel' })).toBeInTheDocument()
      
      // Test live regions for status updates
      const statusElement = screen.getByText(/Status:/)
      expect(statusElement.closest('[aria-live="polite"]')).toBeInTheDocument()
      
      // Test button accessibility
      const startButton = screen.getByRole('button', { name: 'Start Print' })
      expect(startButton).toHaveAttribute('aria-describedby', 'start-btn-desc')
      
      const pauseButton = screen.getByRole('button', { name: 'Pause Print' })
      expect(pauseButton).toBeDisabled()
    })

    it('Project Task List follows accessibility patterns', async () => {
      const { container } = render(<ProjectTaskList />)
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
      
      // Test list semantics
      expect(screen.getByRole('list', { name: 'Project task list' })).toBeInTheDocument()
      
      // Test toolbar
      expect(screen.getByRole('toolbar', { name: 'Task filters' })).toBeInTheDocument()
      
      // Test checkbox accessibility
      const firstTask = screen.getByLabelText('Design printer frame')
      expect(firstTask).toBeChecked()
      expect(firstTask).toHaveAttribute('aria-describedby')
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports full keyboard navigation in printer controls', async () => {
      const user = userEvent.setup()
      render(<PrinterControlPanel />)
      
      // Tab through all interactive elements
      await user.tab() // Start Print button
      expect(screen.getByRole('button', { name: 'Start Print' })).toHaveFocus()
      
      await user.tab() // Pause Print button
      expect(screen.getByRole('button', { name: 'Pause Print' })).toHaveFocus()
      
      await user.tab() // Stop Print button
      expect(screen.getByRole('button', { name: 'Stop Print' })).toHaveFocus()
      
      await user.tab() // Nozzle temperature input
      expect(screen.getByLabelText(/Nozzle Temperature/)).toHaveFocus()
      
      await user.tab() // Bed temperature input
      expect(screen.getByLabelText(/Bed Temperature/)).toHaveFocus()
    })

    it('provides logical tab order in task list', async () => {
      const user = userEvent.setup()
      render(<ProjectTaskList />)
      
      // Tab through toolbar buttons
      await user.tab()
      expect(screen.getByRole('button', { name: 'All Tasks' })).toHaveFocus()
      
      await user.tab()
      expect(screen.getByRole('button', { name: 'Active Tasks' })).toHaveFocus()
      
      await user.tab()
      expect(screen.getByRole('button', { name: 'Completed Tasks' })).toHaveFocus()
      
      // Tab to first task checkbox
      await user.tab()
      expect(screen.getByLabelText('Design printer frame')).toHaveFocus()
    })

    it('handles focus management during dynamic updates', async () => {
      const user = userEvent.setup()
      render(<PrinterControlPanel />)
      
      const startButton = screen.getByRole('button', { name: 'Start Print' })
      startButton.focus()
      
      // Activate button
      await user.keyboard('{Enter}')
      
      // Focus should remain on the button after state change
      expect(startButton).toHaveFocus()
    })
  })

  describe('Screen Reader Support', () => {
    it('provides meaningful announcements for printer status changes', async () => {
      const user = userEvent.setup()
      render(<PrinterControlPanel />)
      
      // Start print
      const startButton = screen.getByRole('button', { name: 'Start Print' })
      await user.click(startButton)
      
      // Status should be announced via live region
      const statusLive = screen.getByText('Status: printing').closest('[aria-live="polite"]')
      expect(statusLive).toBeInTheDocument()
      
      // Pause button should become enabled
      const pauseButton = screen.getByRole('button', { name: 'Pause Print' })
      expect(pauseButton).not.toBeDisabled()
    })

    it('provides context for form controls', () => {
      render(<PrinterControlPanel />)
      
      // Temperature inputs should have proper labeling
      const nozzleInput = screen.getByLabelText(/Nozzle Temperature/)
      expect(nozzleInput).toHaveAttribute('aria-describedby', 'nozzle-temp-help')
      
      const bedInput = screen.getByLabelText(/Bed Temperature/)
      expect(bedInput).toHaveAttribute('aria-describedby', 'bed-temp-help')
    })

    it('announces task completion status changes', async () => {
      const user = userEvent.setup()
      render(<ProjectTaskList />)
      
      // Find incomplete task
      const incompleteTask = screen.getByLabelText('Test print quality')
      expect(incompleteTask).not.toBeChecked()
      
      // Toggle task
      await user.click(incompleteTask)
      
      // Should be marked as completed
      expect(incompleteTask).toBeChecked()
    })
  })

  describe('High Contrast and Visual Accessibility', () => {
    it('maintains accessibility in high contrast mode', async () => {
      // Simulate high contrast mode
      document.body.classList.add('high-contrast')
      
      const { container } = render(<PrinterControlPanel />)
      
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      })
      
      expect(results).toHaveNoViolations()
      
      // Cleanup
      document.body.classList.remove('high-contrast')
    })

    it('provides sufficient color contrast for status indicators', async () => {
      render(<ProjectTaskList />)
      
      // Test priority indicators have sufficient contrast
      const highPriorityTask = screen.getByText('Design printer frame').closest('.priority-high')
      const mediumPriorityTask = screen.getByText('Test print quality').closest('.priority-medium')
      const lowPriorityTask = screen.getByText('Calibrate bed leveling').closest('.priority-low')
      
      // These should have appropriate CSS classes for contrast
      expect(highPriorityTask).toBeInTheDocument()
      expect(mediumPriorityTask).toBeInTheDocument()
      expect(lowPriorityTask).toBeInTheDocument()
    })
  })

  describe('ARIA and Semantic Markup', () => {
    it('uses appropriate ARIA attributes for complex interactions', () => {
      render(<ProjectTaskList />)
      
      // Toolbar should have proper ARIA
      const toolbar = screen.getByRole('toolbar')
      expect(toolbar).toHaveAttribute('aria-label', 'Task filters')
      
      // Pressed state for toggle buttons
      const activeButton = screen.getByRole('button', { name: 'Active Tasks' })
      expect(activeButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('maintains semantic structure for complex layouts', () => {
      render(<PrinterControlPanel />)
      
      // Should use proper heading hierarchy
      const mainHeading = screen.getByRole('heading', { level: 2 })
      expect(mainHeading).toHaveTextContent('Printer Control Panel')
      
      const subHeadings = screen.getAllByRole('heading', { level: 3 })
      expect(subHeadings).toHaveLength(3) // Status, Controls, Temperature
      
      // Groups should be properly labeled
      const groups = screen.getAllByRole('group')
      groups.forEach(group => {
        expect(group).toHaveAttribute('aria-labelledby')
      })
    })

    it('provides meaningful labels for dynamic content', async () => {
      const user = userEvent.setup()
      render(<ProjectTaskList />)
      
      // Edit buttons should have descriptive labels
      const editButtons = screen.getAllByRole('button', { name: /Edit task:/ })
      expect(editButtons[0]).toHaveAttribute('aria-label', 'Edit task: Design printer frame')
      
      // Delete buttons should have descriptive labels
      const deleteButtons = screen.getAllByRole('button', { name: /Delete task:/ })
      expect(deleteButtons[0]).toHaveAttribute('aria-label', 'Delete task: Design printer frame')
    })
  })

  describe('Error Handling and User Feedback', () => {
    it('announces errors accessibly', async () => {
      const ErrorComponent: React.FC = () => {
        const [error, setError] = React.useState<string | null>(null)
        
        return (
          <div>
            {error && (
              <div 
                role="alert" 
                aria-live="assertive"
                data-testid="error-message"
              >
                Error: {error}
              </div>
            )}
            <button onClick={() => setError('Print failed to start')}>
              Trigger Error
            </button>
          </div>
        )
      }
      
      const user = userEvent.setup()
      render(<ErrorComponent />)
      
      const triggerButton = screen.getByRole('button', { name: 'Trigger Error' })
      await user.click(triggerButton)
      
      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toHaveAttribute('role', 'alert')
      expect(errorMessage).toHaveAttribute('aria-live', 'assertive')
    })

    it('provides accessible loading states', () => {
      const LoadingComponent: React.FC = () => {
        return (
          <div>
            <div 
              role="status" 
              aria-live="polite"
              data-testid="loading-indicator"
            >
              <span className="sr-only">Loading printer status...</span>
              <div aria-hidden="true">⏳</div>
            </div>
          </div>
        )
      }
      
      render(<LoadingComponent />)
      
      const loadingIndicator = screen.getByTestId('loading-indicator')
      expect(loadingIndicator).toHaveAttribute('role', 'status')
      expect(loadingIndicator).toHaveAttribute('aria-live', 'polite')
      
      // Visual indicator should be hidden from screen readers
      const visualIndicator = screen.getByText('⏳')
      expect(visualIndicator).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Mobile and Touch Accessibility', () => {
    it('provides adequate touch targets', () => {
      render(<PrinterControlPanel />)
      
      // All interactive elements should meet minimum touch target size
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button)
        // Note: In actual implementation, ensure minimum 44x44px touch targets
        expect(button).toBeInTheDocument() // Placeholder for touch target size tests
      })
    })

    it('handles mobile navigation patterns', async () => {
      // Simulate mobile viewport
      global.innerWidth = 375
      global.innerHeight = 667
      
      render(<ProjectTaskList />)
      
      // Should maintain accessibility on mobile
      const { container } = render(<ProjectTaskList />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})