import { EventEmitter } from 'node:events'

export type ProjectEvents =
  | { type: 'project.created'; payload: { id: string; name: string; status: string } }
  | { type: 'project.updated'; payload: { id: string; name?: string; status?: string } }
  | { type: 'project.deleted'; payload: { id: string } }

class TypedEventBus extends EventEmitter {
  emitEvent(ev: ProjectEvents) {
    return this.emit(ev.type, ev.payload)
  }
  onEvent<T extends ProjectEvents['type']>(type: T, listener: (payload: Extract<ProjectEvents,{type:T}>['payload']) => void) {
    this.on(type, listener as any)
    return this
  }
}

export const eventBus = new TypedEventBus()
