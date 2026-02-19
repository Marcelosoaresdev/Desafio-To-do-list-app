import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { API_URL } from '@/lib/api'

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
    setTasks((currentTasks) => [result, ...currentTasks])
  }

  async function updateTask(id, data) {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error)
    setTasks((currentTasks) => currentTasks.map((task) => (task.id === id ? result : task)))
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
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id))
  }

  async function toggleItem(taskId, itemId) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskId) return task
        return {
          ...task,
          items: task.items.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item,
          ),
        }
      }),
    )

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/items/${itemId}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      setTasks((currentTasks) =>
        currentTasks.map((task) => {
          if (task.id !== taskId) return task
          return {
            ...task,
            items: task.items.map((item) => (item.id === itemId ? result : item)),
          }
        }),
      )
    } catch {
      setTasks((currentTasks) =>
        currentTasks.map((task) => {
          if (task.id !== taskId) return task
          return {
            ...task,
            items: task.items.map((item) =>
              item.id === itemId ? { ...item, completed: !item.completed } : item,
            ),
          }
        }),
      )
      toast.error('Erro ao atualizar item.')
    }
  }

  return { tasks, isLoading, createTask, updateTask, deleteTask, toggleItem }
}
