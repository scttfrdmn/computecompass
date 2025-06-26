import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WorkloadPatternInput } from './WorkloadPatternInput'
import type { WorkloadPattern } from '../types/consumption'

const defaultPattern: WorkloadPattern = {
  id: 'test-pattern',
  name: 'Test Workload',
  description: 'Test description',
  runsPerDay: 2,
  avgDurationHours: 4,
  daysPerWeek: 5,
  instanceRequirements: {
    vCpus: 4,
    memoryGiB: 8,
    gpuRequired: false,
  },
  seasonality: {
    type: 'steady',
  },
  priority: 'normal',
  interruptible: false,
}

describe('WorkloadPatternInput', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('renders all form fields', () => {
    render(<WorkloadPatternInput pattern={defaultPattern} onChange={mockOnChange} />)

    expect(screen.getByLabelText(/workload name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/runs per day/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/avg duration/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/days per week/i)).toBeInTheDocument()
    expect(screen.getByText('Seasonality Pattern')).toBeInTheDocument()
    expect(screen.getByText('Workload Priority')).toBeInTheDocument()
  })

  it('displays current pattern values', () => {
    render(<WorkloadPatternInput pattern={defaultPattern} onChange={mockOnChange} />)

    expect(screen.getByDisplayValue('Test Workload')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument() // runsPerDay
    expect(screen.getByDisplayValue('4')).toBeInTheDocument() // avgDurationHours
    expect(screen.getByDisplayValue('5')).toBeInTheDocument() // daysPerWeek
  })

  it('updates workload name when input changes', async () => {
    const user = userEvent.setup()
    render(<WorkloadPatternInput pattern={defaultPattern} onChange={mockOnChange} />)

    const nameInput = screen.getByLabelText(/workload name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'New Workload Name')

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Workload Name' })
      )
    })
  })

  it('updates description when input changes', async () => {
    const user = userEvent.setup()
    render(<WorkloadPatternInput pattern={defaultPattern} onChange={mockOnChange} />)

    const descInput = screen.getByLabelText(/description/i)
    await user.clear(descInput)
    await user.type(descInput, 'New description')

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'New description' })
      )
    })
  })

  it('updates frequency settings', async () => {
    render(<WorkloadPatternInput pattern={defaultPattern} onChange={mockOnChange} />)

    // Clear the initial onChange call from useEffect
    mockOnChange.mockClear()

    // Test runs per day
    const runsInput = screen.getByLabelText(/runs per day/i)
    fireEvent.change(runsInput, { target: { value: '3' } })

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ runsPerDay: 3 })
      )
    })

    // Clear mock to test next input
    mockOnChange.mockClear()

    // Test duration
    const durationInput = screen.getByLabelText(/avg duration/i)
    fireEvent.change(durationInput, { target: { value: '6' } })

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ avgDurationHours: 6 })
      )
    })

    // Clear mock to test next input
    mockOnChange.mockClear()

    // Test days per week
    const daysInput = screen.getByLabelText(/days per week/i)
    fireEvent.change(daysInput, { target: { value: '7' } })

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ daysPerWeek: 7 })
      )
    })
  })

  it('handles seasonality pattern selection', async () => {
    const user = userEvent.setup()
    render(<WorkloadPatternInput pattern={defaultPattern} onChange={mockOnChange} />)

    const academicRadio = screen.getByLabelText(/academic calendar/i)
    await user.click(academicRadio)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          seasonality: expect.objectContaining({ type: 'academic' })
        })
      )
    })
  })

  it('updates priority setting', async () => {
    const user = userEvent.setup()
    render(<WorkloadPatternInput pattern={defaultPattern} onChange={mockOnChange} />)

    const prioritySelect = screen.getByRole('combobox')
    await user.selectOptions(prioritySelect, 'high')

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ priority: 'high' })
      )
    })
  })

  it('toggles interruptible setting', async () => {
    const user = userEvent.setup()
    render(<WorkloadPatternInput pattern={defaultPattern} onChange={mockOnChange} />)

    const interruptibleSwitch = screen.getByRole('switch')
    await user.click(interruptibleSwitch)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ interruptible: true })
      )
    })
  })

  it('displays pattern summary correctly', () => {
    render(<WorkloadPatternInput pattern={defaultPattern} onChange={mockOnChange} />)

    // Daily hours: 2 runs * 4 hours = 8 hours
    expect(screen.getByText('8.0h')).toBeInTheDocument()
    
    // Weekly hours: 8 daily hours * 5 days = 40 hours
    expect(screen.getByText('40.0h')).toBeInTheDocument()
    
    expect(screen.getByText('steady')).toBeInTheDocument()
    expect(screen.getByText('normal')).toBeInTheDocument()
  })

  it('handles decimal input for frequency values', async () => {
    const user = userEvent.setup()
    render(<WorkloadPatternInput pattern={defaultPattern} onChange={mockOnChange} />)

    const runsInput = screen.getByLabelText(/runs per day/i)
    await user.clear(runsInput)
    await user.type(runsInput, '1.5')

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ runsPerDay: 1.5 })
      )
    })

    const durationInput = screen.getByLabelText(/avg duration/i)
    await user.clear(durationInput)
    await user.type(durationInput, '2.5')

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ avgDurationHours: 2.5 })
      )
    })
  })

  it('shows all seasonality options', () => {
    render(<WorkloadPatternInput pattern={defaultPattern} onChange={mockOnChange} />)

    expect(screen.getByText('Steady')).toBeInTheDocument()
    expect(screen.getByText('Academic Calendar')).toBeInTheDocument()
    expect(screen.getByText('Grant Cycles')).toBeInTheDocument()
    expect(screen.getByText('Seasonal Research')).toBeInTheDocument()
  })

  it('shows all priority options', () => {
    render(<WorkloadPatternInput pattern={defaultPattern} onChange={mockOnChange} />)

    const prioritySelect = screen.getByRole('combobox')
    
    // Check that priority options exist
    expect(screen.getByText(/Low - Can wait for cheaper spot instances/)).toBeInTheDocument()
    expect(screen.getByText(/Normal - Balance cost and availability/)).toBeInTheDocument()
    expect(screen.getByText(/High - Need guaranteed capacity/)).toBeInTheDocument()
    expect(screen.getByText(/Critical - Mission-critical workloads/)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <WorkloadPatternInput 
        pattern={defaultPattern} 
        onChange={mockOnChange} 
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('handles edge case of zero values', async () => {
    render(<WorkloadPatternInput pattern={defaultPattern} onChange={mockOnChange} />)

    // Clear the initial onChange call from useEffect
    mockOnChange.mockClear()

    const runsInput = screen.getByLabelText(/runs per day/i)
    fireEvent.change(runsInput, { target: { value: '0' } })

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ runsPerDay: 0 })
      )
    })

    // Should show 0.0h in daily and weekly summary
    expect(screen.getAllByText('0.0h')).toHaveLength(2)
  })

  it('updates summary when pattern changes', async () => {
    const user = userEvent.setup()
    render(<WorkloadPatternInput pattern={defaultPattern} onChange={mockOnChange} />)

    // Change runs to 3 and duration to 6
    const runsInput = screen.getByLabelText(/runs per day/i)
    await user.clear(runsInput)
    await user.type(runsInput, '3')

    const durationInput = screen.getByLabelText(/avg duration/i)
    await user.clear(durationInput)
    await user.type(durationInput, '6')

    // Daily hours should be 3 * 6 = 18
    await waitFor(() => {
      expect(screen.getByText('18.0h')).toBeInTheDocument()
    })
  })
})