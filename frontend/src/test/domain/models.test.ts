import { describe, it, expect } from 'vitest';
import { Money, Task, TaskStatus } from '../../pages/project-management/domain/models';

describe('Money', () => {
  it('adds amounts', () => {
    const a = new Money(10, 'USD');
    const b = new Money(5, 'USD');
    expect(a.add(b).toString()).toBe('USD 15.00');
  });
  it('throws currency mismatch', () => {
    const a = new Money(10, 'USD');
    const b = new Money(5, 'EUR');
    expect(() => a.add(b)).toThrow();
  });
});

describe('Task', () => {
  it('legal transition', () => {
    const t = new Task('1', 'Title', 'Desc');
    expect(t.canTransitionTo(TaskStatus.IN_PROGRESS)).toBe(true);
  });
  it('illegal transition', () => {
    const t = new Task('1', 'Title', 'Desc');
    expect(t.canTransitionTo(TaskStatus.DONE)).toBe(false);
  });
});
