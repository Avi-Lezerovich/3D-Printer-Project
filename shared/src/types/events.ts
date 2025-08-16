// Socket.io event name → payload typing

export interface SocketEvents {
  'projects:created': { id: string; name: string }
  'projects:updated': { id: string; status: string }
  'tasks:created': { id: string; title: string; projectId?: string | null }
}
