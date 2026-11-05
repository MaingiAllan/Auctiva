package com.auctiva.backend.payments;

public class MpesaException extends RuntimeException {
    private final boolean outcomeUnknown;

    public MpesaException(String message) {
        this(message, false);
    }

    public MpesaException(String message, boolean outcomeUnknown) {
        super(message);
        this.outcomeUnknown = outcomeUnknown;
    }

    public boolean isOutcomeUnknown() {
        return outcomeUnknown;
    }
}
