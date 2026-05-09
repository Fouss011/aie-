const API_URL = import.meta.env.VITE_API_URL

export async function getNotes(structureId) {
  const response = await fetch(`${API_URL}/api/notes/${structureId}`)
  return response.json()
}

export async function createNote(note) {
  const response = await fetch(`${API_URL}/api/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(note)
  })

  return response.json()
}

export async function deleteNote(id) {
  await fetch(`${API_URL}/api/notes/${id}`, {
    method: 'DELETE'
  })
}