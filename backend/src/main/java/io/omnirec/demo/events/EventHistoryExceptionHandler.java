package io.omnirec.demo.events;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
class EventHistoryExceptionHandler {

    @ExceptionHandler(InvalidCursorException.class)
    ResponseEntity<ApiError> invalidCursor() {
        return response(HttpStatus.BAD_REQUEST, "invalid_cursor", "The event-history cursor is invalid.");
    }

    @ExceptionHandler(EventHistoryNotConfiguredException.class)
    ResponseEntity<ApiError> notConfigured() {
        return response(
                HttpStatus.SERVICE_UNAVAILABLE,
                "history_not_configured",
                "Stored event history is not configured for this demo."
        );
    }

    @ExceptionHandler(EventHistoryUpstreamException.class)
    ResponseEntity<ApiError> upstreamUnavailable() {
        return response(
                HttpStatus.BAD_GATEWAY,
                "history_unavailable",
                "Stored event history is temporarily unavailable."
        );
    }

    private static ResponseEntity<ApiError> response(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status)
                .cacheControl(org.springframework.http.CacheControl.noStore())
                .body(new ApiError(code, message, Instant.now()));
    }

    record ApiError(String error, String message, Instant timestamp) {
    }
}

