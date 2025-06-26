import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WorkloadSelector } from './WorkloadSelector'
import { RESEARCH_WORKLOADS } from '../types'

describe('WorkloadSelector', () => {
  const mockOnWorkloadChange = vi.fn()

  beforeEach(() => {
    mockOnWorkloadChange.mockClear()
  })

  it('renders with placeholder text when no workload is selected', () => {
    render(
      <WorkloadSelector
        selectedWorkload={null}
        onWorkloadChange={mockOnWorkloadChange}
      />
    )
    expect(
      screen.getByText('Select a research workload...')
    ).toBeInTheDocument()
  })

  it('displays the selected workload', () => {
    const testWorkload = RESEARCH_WORKLOADS[0]
    render(
      <WorkloadSelector
        selectedWorkload={testWorkload}
        onWorkloadChange={mockOnWorkloadChange}
      />
    )
    expect(screen.getByText(testWorkload.name)).toBeInTheDocument()
  })

  it('shows workload requirements when a workload is selected', () => {
    const testWorkload = RESEARCH_WORKLOADS.find(
      w => w.id === 'genome-assembly'
    )!
    render(
      <WorkloadSelector
        selectedWorkload={testWorkload}
        onWorkloadChange={mockOnWorkloadChange}
      />
    )

    expect(screen.getByText('Workload Requirements')).toBeInTheDocument()
    expect(
      screen.getByText(`Minimum vCPUs: ${testWorkload.requirements.minVCpus}`)
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        `Minimum Memory: ${testWorkload.requirements.minMemoryGiB} GiB`
      )
    ).toBeInTheDocument()
  })

  it('shows GPU requirements when workload requires GPU', () => {
    const gpuWorkload = RESEARCH_WORKLOADS.find(w => w.requirements.requireGpu)!
    render(
      <WorkloadSelector
        selectedWorkload={gpuWorkload}
        onWorkloadChange={mockOnWorkloadChange}
      />
    )

    expect(screen.getByText(/GPU Required/)).toBeInTheDocument()
  })

  it('has a clickable dropdown button', () => {
    render(
      <WorkloadSelector
        selectedWorkload={null}
        onWorkloadChange={mockOnWorkloadChange}
      />
    )

    const button = screen.getByText('Select a research workload...')
    expect(button).toBeInTheDocument()
    expect(button.closest('button')).toBeInTheDocument()
  })

  it('displays research workload template label', () => {
    render(
      <WorkloadSelector
        selectedWorkload={null}
        onWorkloadChange={mockOnWorkloadChange}
      />
    )

    expect(screen.getByText('Research Workload Template')).toBeInTheDocument()
  })
})
