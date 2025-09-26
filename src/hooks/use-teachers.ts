import { useState, useEffect, useCallback } from 'react'
import { Teacher, TeachersResponse } from '@/types/teacher'

interface UseTeachersReturn {
  teachers: Teacher[]
  loading: boolean
  error: string | null
  refetch: () => void
  syncTeachers: () => Promise<{ message: string; syncedTeachers: number; totalTeachers: number; newTeachers: number }>
  syncing: boolean
}

export function useTeachers(): UseTeachersReturn {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/teachers')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: TeachersResponse = await response.json()

      if ('error' in data) {
        throw new Error(data.error as string)
      }

      setTeachers(data.teachers || [])
    } catch (err) {
      console.error('Error fetching teachers:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setTeachers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTeachers()
  }, [fetchTeachers])

  const syncTeachers = useCallback(async () => {
    try {
      setSyncing(true)
      setError(null)

      const response = await fetch('/api/teachers', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Refetch teachers after sync
      await fetchTeachers()

      return {
        message: data.message,
        syncedTeachers: data.syncedTeachers,
        totalTeachers: data.totalTeachers,
        newTeachers: data.newTeachers
      }
    } catch (err) {
      console.error('Error syncing teachers:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setSyncing(false)
    }
  }, [fetchTeachers])

  const refetch = () => {
    fetchTeachers()
  }

  return {
    teachers,
    loading,
    error,
    refetch,
    syncTeachers,
    syncing
  }
}