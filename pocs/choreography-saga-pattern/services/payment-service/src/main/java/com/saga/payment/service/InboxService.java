package com.saga.payment.service;

import com.saga.payment.domain.InboxEvent;
import com.saga.payment.events.EventEnvelope;
import com.saga.payment.repository.InboxEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InboxService {

    private final InboxEventRepository repo;

    public InboxService(InboxEventRepository repo) {
        this.repo = repo;
    }

    /**
     * Runs the handler and records the event id in the same transaction, making
     * the at-least-once delivery idempotent and the state change atomic with the
     * dedupe marker.
     *
     * @return true when the event was processed, false when it was a duplicate
     */
    @Transactional
    public boolean process(EventEnvelope envelope, Runnable handler) {
        if (repo.existsById(envelope.eventId())) {
            return false;
        }
        handler.run();
        repo.save(new InboxEvent(envelope.eventId(), envelope.eventType(), envelope.correlationId()));
        return true;
    }
}
