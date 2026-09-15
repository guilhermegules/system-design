package com.saga.inventory.application;

import com.saga.inventory.application.port.InboxRepository;
import com.saga.inventory.domain.event.EventEnvelope;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InboxService {

  private final InboxRepository repo;

  public InboxService(InboxRepository repo) {
    this.repo = repo;
  }

  /**
   * Runs the handler and records the event id in the same transaction, making the at-least-once
   * delivery idempotent and the state change atomic with the dedupe marker.
   *
   * @return true when the event was processed, false when it was a duplicate
   */
  @Transactional
  public boolean process(EventEnvelope envelope, Runnable handler) {
    if (repo.exists(envelope.eventId())) {
      return false;
    }
    handler.run();
    repo.markProcessed(envelope);
    return true;
  }
}
