import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Spinner from '../components/Spinner'

describe('Spinner', () => {
  it('renders with default props and status role', () => {
    render(<Spinner />)
    const status = screen.getByRole('status')
    expect(status).toBeInTheDocument()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('supports large secondary variant and custom label', () => {
    render(<Spinner label="Please wait" size="large" variant="secondary" centered />)
    expect(screen.getByText('Please wait')).toBeInTheDocument()
  })
})
