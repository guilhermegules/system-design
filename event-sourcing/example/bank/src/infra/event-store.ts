import { DomainEvent } from "../domain/domain-event";

export class InMemoryEventStore {
  private events: DomainEvent[] = [];

  append(events: DomainEvent[]) {
    this.events.push(...events);
  }

  getByAggregateId(aggregateId: string): DomainEvent[] {
    return this.events.filter((e) => e.aggregateId === aggregateId);
  }
}
