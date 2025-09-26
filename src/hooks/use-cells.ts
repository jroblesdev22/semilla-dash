import { useState, useEffect, useCallback } from 'react'
import {
  Cell,
  CellsResponse,
  CreateCellRequest,
  CreateCellResponse,
  AssignUserToCellRequest,
  AssignUserResponse
} from '@/types/cell'

interface UseCellsReturn {
  cells: Cell[]
  loading: boolean
  error: string | null
  refetch: () => void
  createCell: (cellData: CreateCellRequest) => Promise<CreateCellResponse>
  assignUserToCell: (assignData: AssignUserToCellRequest) => Promise<AssignUserResponse>
  creating: boolean
  assigning: boolean
}

export function useCells(): UseCellsReturn {
  const [cells, setCells] = useState<Cell[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [assigning, setAssigning] = useState(false)

  const fetchCells = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/cells')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: CellsResponse = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setCells(data.cells || [])
    } catch (err) {
      console.error('Error fetching cells:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setCells([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCells()
  }, [fetchCells])

  const createCell = useCallback(async (cellData: CreateCellRequest): Promise<CreateCellResponse> => {
    try {
      setCreating(true)
      setError(null)

      const response = await fetch('/api/cells', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cellData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: CreateCellResponse = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Refetch cells after successful creation
      await fetchCells()

      return data
    } catch (err) {
      console.error('Error creating cell:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setCreating(false)
    }
  }, [fetchCells])

  const assignUserToCell = useCallback(async (assignData: AssignUserToCellRequest): Promise<AssignUserResponse> => {
    try {
      setAssigning(true)
      setError(null)

      const response = await fetch('/api/cells/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: AssignUserResponse = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Refetch cells after successful assignment
      await fetchCells()

      return data
    } catch (err) {
      console.error('Error assigning user to cell:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setAssigning(false)
    }
  }, [fetchCells])

  const refetch = () => {
    fetchCells()
  }

  return {
    cells,
    loading,
    error,
    refetch,
    createCell,
    assignUserToCell,
    creating,
    assigning
  }
}