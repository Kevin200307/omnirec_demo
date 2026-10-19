package io.omnirec.demo.events;

final class InvalidCursorException extends RuntimeException {
}

final class EventHistoryNotConfiguredException extends RuntimeException {
}

final class EventHistoryUpstreamException extends RuntimeException {
    EventHistoryUpstreamException(int statusCode) {
        super("OmniRec history API returned HTTP " + statusCode);
    }

    EventHistoryUpstreamException(Throwable cause) {
        super("OmniRec history API request failed", cause);
    }
}

