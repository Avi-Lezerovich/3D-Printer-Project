import { EventEmitter } from 'node:events'

// Add a version field to each payload for future evolution / consumers.
export interface Versioned<T> { version: number; data: T }

export type ProjectEvents =
  | { type: 'project.created'; payload: Versioned<{ id: string; name: string; status: string }> }
  | { type: 'project.updated'; payload: Versioned<{ id: string; name?: string; status?: string }> }
  | { type: 'project.deleted'; payload: Versioned<{ id: string }> }

class TypedEventBus extends EventEmitter {
  emitEvent(ev: ProjectEvents) { return this.emit(ev.type, ev.payload) }
  onEvent<T extends ProjectEvents['type']>(type: T, listener: (payload: Extract<ProjectEvents,{type:T}>['payload']) => void) {
    this.on(type, listener as any); return this
  }
}

export const eventBus = new TypedEventBus()
export const EVENT_VERSION = 1
