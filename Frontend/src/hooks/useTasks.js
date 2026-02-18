import { useState, useEffect } from 'react'
import { toast } from 'sonner'

const API_URL = 'http://localhost:3000'

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        headers: getAuthHeaders(),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setTasks(data)
    } catch {
      toast.error('Erro ao carregar tarefas.')
    } finally {
      setIsLoading(false)
    }
  }

  async function createTask(data) {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error)
    setTasks((prev) => [result, ...prev])
  }

  async function updateTask(id, data) {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error)
    setTasks((prev) => prev.map((t) => (t.id === id ? result : t)))
  }

  async function deleteTask(id) {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.error)
    }
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  return { tasks, isLoading, createTask, updateTask, deleteTask }
}
