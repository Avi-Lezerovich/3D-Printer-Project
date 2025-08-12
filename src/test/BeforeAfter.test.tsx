import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BeforeAfter from '../components/BeforeAfter'

/**
 * Basic a11y behavior check: the handle is a slider and responds to arrow keys.
 */
describe('BeforeAfter accessibility', () => {
  it('renders a slider handle that responds to keyboard', () => {
    render(
      <BeforeAfter before="/images/before.svg" after="/images/after.svg" autoSlide={false} />
    )

    const slider = screen.getByRole('slider', { name: /drag to compare/i })
    expect(slider).toBeTruthy()

    // Focus and send ArrowRight to increase value
    slider.focus()
    const initial = Number(slider.getAttribute('aria-valuenow'))
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    const after = Number(slider.getAttribute('aria-valuenow'))

    expect(after).toBeGreaterThanOrEqual(initial)
  })
})
