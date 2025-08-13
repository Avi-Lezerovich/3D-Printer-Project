import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Portfolio from '../pages/Portfolio'

describe('Portfolio page', () => {
	it('renders headings', () => {
		render(<Portfolio />)
		expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
	})
})
