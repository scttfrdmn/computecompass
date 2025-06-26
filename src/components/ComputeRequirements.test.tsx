import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComputeRequirementsComponent } from './ComputeRequirements'
import type { ComputeRequirements } from '../types'

describe('ComputeRequirementsComponent', () => {
  const defaultRequirements: ComputeRequirements = {}
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('renders all form fields', () => {
    render(
      <ComputeRequirementsComponent
        requirements={defaultRequirements}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByLabelText(/minimum vcpus/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maximum vcpus/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/minimum memory/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maximum memory/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/gpu required/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/processor architecture/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/storage type/i)).toBeInTheDocument()
  })

  it('populates fields with initial requirements', () => {
    const requirements: ComputeRequirements = {
      minVCpus: 4,
      maxVCpus: 16,
      minMemoryGiB: 8,
      maxMemoryGiB: 64,
      requireGpu: true,
      minGpuMemoryGiB: 8,
      architecture: 'x86_64',
      storageType: 'ebs',
      networkPerformance: ['High', 'Up to 10 Gigabit'],
    }

    render(
      <ComputeRequirementsComponent
        requirements={requirements}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByDisplayValue('4')).toBeInTheDocument() // min vCPUs
    expect(screen.getByDisplayValue('16')).toBeInTheDocument() // max vCPUs
    expect(screen.getByDisplayValue('64')).toBeInTheDocument() // max memory
    expect(screen.getByDisplayValue('x86_64 (Intel/AMD)')).toBeInTheDocument()
    expect(
      screen.getByDisplayValue('EBS Only (Network Storage)')
    ).toBeInTheDocument()

    // Check specific fields by ID
    expect(screen.getByLabelText(/minimum memory/i)).toHaveValue(8)
    expect(screen.getByLabelText(/minimum gpu memory/i)).toHaveValue(8)
  })

  it('updates minimum vCPUs when input changes', async () => {
    const user = userEvent.setup()

    render(
      <ComputeRequirementsComponent
        requirements={defaultRequirements}
        onChange={mockOnChange}
      />
    )

    const minVCpusInput = screen.getByLabelText(/minimum vcpus/i)
    await user.type(minVCpusInput, '8')

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ minVCpus: 8 })
      )
    })
  })

  it('updates memory requirements when inputs change', async () => {
    const user = userEvent.setup()

    render(
      <ComputeRequirementsComponent
        requirements={defaultRequirements}
        onChange={mockOnChange}
      />
    )

    const minMemoryInput = screen.getByLabelText(/minimum memory/i)
    await user.type(minMemoryInput, '16')

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ minMemoryGiB: 16 })
      )
    })
  })

  it('shows GPU memory input when GPU is required', async () => {
    const user = userEvent.setup()

    render(
      <ComputeRequirementsComponent
        requirements={defaultRequirements}
        onChange={mockOnChange}
      />
    )

    // Initially GPU memory input should not be visible
    expect(
      screen.queryByLabelText(/minimum gpu memory/i)
    ).not.toBeInTheDocument()

    // Toggle GPU requirement
    const gpuSwitch = screen.getByRole('switch')
    await user.click(gpuSwitch)

    // Now GPU memory input should be visible
    expect(screen.getByLabelText(/minimum gpu memory/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ requireGpu: true })
      )
    })
  })

  it('updates GPU memory requirement when input changes', async () => {
    const user = userEvent.setup()
    const requirementsWithGpu: ComputeRequirements = { requireGpu: true }

    render(
      <ComputeRequirementsComponent
        requirements={requirementsWithGpu}
        onChange={mockOnChange}
      />
    )

    const gpuMemoryInput = screen.getByLabelText(/minimum gpu memory/i)
    await user.type(gpuMemoryInput, '16')

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          requireGpu: true,
          minGpuMemoryGiB: 16,
        })
      )
    })
  })

  it('updates architecture selection', async () => {
    const user = userEvent.setup()

    render(
      <ComputeRequirementsComponent
        requirements={defaultRequirements}
        onChange={mockOnChange}
      />
    )

    const architectureSelect = screen.getByLabelText(/processor architecture/i)
    await user.selectOptions(architectureSelect, 'arm64')

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ architecture: 'arm64' })
      )
    })
  })

  it('updates storage type selection', async () => {
    const user = userEvent.setup()

    render(
      <ComputeRequirementsComponent
        requirements={defaultRequirements}
        onChange={mockOnChange}
      />
    )

    const storageSelect = screen.getByLabelText(/storage type/i)
    await user.selectOptions(storageSelect, 'instance')

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ storageType: 'instance' })
      )
    })
  })

  it('handles network performance selections', async () => {
    const user = userEvent.setup()

    render(
      <ComputeRequirementsComponent
        requirements={defaultRequirements}
        onChange={mockOnChange}
      />
    )

    // Check one network performance option
    const highPerformanceCheckbox = screen.getByLabelText('High')
    await user.click(highPerformanceCheckbox)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          networkPerformance: ['High'],
        })
      )
    })
  })

  it('displays requirements summary when fields are filled', () => {
    const requirements: ComputeRequirements = {
      minVCpus: 4,
      minMemoryGiB: 8,
      requireGpu: true,
      minGpuMemoryGiB: 8,
      architecture: 'x86_64',
    }

    render(
      <ComputeRequirementsComponent
        requirements={requirements}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByText('Requirements Summary')).toBeInTheDocument()
    expect(screen.getByText('vCPUs: 4')).toBeInTheDocument()
    expect(screen.getByText('Memory: 8 GiB')).toBeInTheDocument()
    expect(screen.getByText('GPU Required (8 GiB VRAM)')).toBeInTheDocument()
    expect(screen.getByText('Architecture: x86_64')).toBeInTheDocument()
  })

  it('validates minimum values are not negative', async () => {
    render(
      <ComputeRequirementsComponent
        requirements={defaultRequirements}
        onChange={mockOnChange}
      />
    )

    const minVCpusInput = screen.getByLabelText(/minimum vcpus/i)
    expect(minVCpusInput).toHaveAttribute('min', '1')

    const minMemoryInput = screen.getByLabelText(/minimum memory/i)
    expect(minMemoryInput).toHaveAttribute('min', '0.5')
  })

  it('ensures maximum values are greater than minimum values', () => {
    const requirements: ComputeRequirements = {
      minVCpus: 8,
      minMemoryGiB: 16,
    }

    render(
      <ComputeRequirementsComponent
        requirements={requirements}
        onChange={mockOnChange}
      />
    )

    const maxVCpusInput = screen.getByLabelText(/maximum vcpus/i)
    expect(maxVCpusInput).toHaveAttribute('min', '8')

    const maxMemoryInput = screen.getByLabelText(/maximum memory/i)
    expect(maxMemoryInput).toHaveAttribute('min', '16')
  })

  it('applies custom className', () => {
    const { container } = render(
      <ComputeRequirementsComponent
        requirements={defaultRequirements}
        onChange={mockOnChange}
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('handles empty string inputs correctly', async () => {
    const user = userEvent.setup()
    const requirements: ComputeRequirements = { minVCpus: 4 }

    render(
      <ComputeRequirementsComponent
        requirements={requirements}
        onChange={mockOnChange}
      />
    )

    const minVCpusInput = screen.getByLabelText(/minimum vcpus/i)
    await user.clear(minVCpusInput)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ minVCpus: undefined })
      )
    })
  })

  it('handles network performance deselection', async () => {
    const requirements: ComputeRequirements = {
      networkPerformance: ['High', 'Up to 10 Gigabit'],
    }

    render(
      <ComputeRequirementsComponent
        requirements={requirements}
        onChange={mockOnChange}
      />
    )

    // Uncheck one option
    const highPerformanceCheckbox = screen.getByLabelText('High')
    await userEvent.setup().click(highPerformanceCheckbox)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          networkPerformance: ['Up to 10 Gigabit'],
        })
      )
    })
  })
})
