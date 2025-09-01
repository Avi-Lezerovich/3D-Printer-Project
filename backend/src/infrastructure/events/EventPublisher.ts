import type { DomainEvent } from '../../shared/types/domain.types.js';
import type { IEventPublisher } from '../../shared/interfaces/service.interface.js';

/**
 * Event Publisher Implementation
 * Handles publishing domain events to subscribers
 */
export class EventPublisher implements IEventPublisher {
  private subscribers: Map<string, EventHandler[]> = new Map();

  /**
   * Publish a single domain event
   */
  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.subscribers.get(event.type) || [];
    
    // Execute all handlers in parallel
    const promises = handlers.map(handler => 
      this.executeHandler(handler, event)
    );

    await Promise.allSettled(promises);
  }

  /**
   * Publish multiple domain events
   */
  async publishMany(events: DomainEvent[]): Promise<void> {
    const promises = events.map(event => this.publish(event));
    await Promise.allSettled(promises);
  }

  /**
   * Subscribe to domain events
   */
  subscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.subscribers.get(eventType) || [];
    handlers.push(handler);
    this.subscribers.set(eventType, handlers);
  }

  /**
   * Unsubscribe from domain events
   */
  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.subscribers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    
    if (index >= 0) {
      handlers.splice(index, 1);
      this.subscribers.set(eventType, handlers);
    }
  }

  /**
   * Get all subscribers for an event type
   */
  getSubscribers(eventType: string): EventHandler[] {
    return this.subscribers.get(eventType) || [];
  }

  /**
   * Clear all subscribers
   */
  clear(): void {
    this.subscribers.clear();
  }

  private async executeHandler(handler: EventHandler, event: DomainEvent): Promise<void> {
    try {
      await handler.handle(event);
    } catch (error) {
      // Log error but don't throw - we don't want one handler failure to affect others
      console.error(`Error executing event handler for ${event.type}:`, error);
      
      // Optionally, you could emit a failure event here
      // await this.publish(new HandlerFailureEvent(event, error));
    }
  }
}

/**
 * Event Handler Interface
 */
export interface EventHandler {
  handle(event: DomainEvent): Promise<void>;
}

/**
 * Base Event Handler Class
 * Provides common functionality for event handlers
 */
export abstract class BaseEventHandler implements EventHandler {
  abstract handle(event: DomainEvent): Promise<void>;

  protected validateEvent(event: DomainEvent, expectedType: string): void {
    if (event.type !== expectedType) {
      throw new Error(`Expected event type ${expectedType}, got ${event.type}`);
    }
  }

  protected extractEventData<T>(event: DomainEvent): T {
    return event.data as T;
  }
}
