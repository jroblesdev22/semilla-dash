import { useState, useEffect, useCallback } from 'react'
import { Cell, CellsResponse, CreateCellRequest, CreateCellResponse } from '@/types/cell'

interface UseCellsReturn {
  cells: Cell[]
  loading: boolean
  error: string | null
  refetch: () => void
  createCell: (cellData: CreateCellRequest) => Promise<CreateCellResponse>
  creating: boolean
}

export function useCells(): UseCellsReturn {
  const [cells, setCells] = useState<Cell[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

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

  const refetch = () => {
    fetchCells()
  }

  return {
    cells,
    loading,
    error,
    refetch,
    createCell,
    creating
  }
}