package io.omnirec.demo.events;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "demo.omnirec")
public record EventHistoryProperties(
        String eventApiUrl,
        String historySecret,
        String customerId
) {
    private static final String DEFAULT_EVENT_API_URL = "http://localhost:8081";
    private static final String DEFAULT_CUSTOMER_ID = "demo_customer_123";

    public EventHistoryProperties {
        eventApiUrl = valueOrDefault(eventApiUrl, DEFAULT_EVENT_API_URL);
        historySecret = historySecret == null ? "" : historySecret.trim();
        customerId = valueOrDefault(customerId, DEFAULT_CUSTOMER_ID);
    }

    public boolean hasHistorySecret() {
        return !historySecret.isBlank();
    }

    private static String valueOrDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }
}

