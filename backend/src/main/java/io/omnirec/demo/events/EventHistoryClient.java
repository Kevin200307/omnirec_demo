package io.omnirec.demo.events;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.Objects;
import java.util.regex.Pattern;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class EventHistoryClient {
    private static final int HISTORY_LIMIT = 100;
    private static final int MAX_CURSOR_LENGTH = 4096;
    private static final Pattern CONTROL_CHARACTER = Pattern.compile("[\\p{Cntrl}]");

    private final RestClient restClient;
    private final EventHistoryProperties properties;

    EventHistoryClient(RestClient omnirecHistoryRestClient, EventHistoryProperties properties) {
        this.restClient = omnirecHistoryRestClient;
        this.properties = properties;
    }

    public JsonNode getStoredEvents(String cursor) {
        if (!properties.hasHistorySecret()) {
            throw new EventHistoryNotConfiguredException();
        }
        validateCursor(cursor);

        try {
            JsonNode response = restClient.get()
                    .uri(uriBuilder -> {
                        var builder = uriBuilder
                                .path("/v1/customers/{customerId}/events")
                                .queryParam("limit", HISTORY_LIMIT);
                        if (cursor != null && !cursor.isBlank()) {
                            builder.queryParam("cursor", cursor);
                        }
                        return builder.build(properties.customerId());
                    })
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.historySecret())
                    .retrieve()
                    .onStatus(
                            status -> status.isError(),
                            (request, responseStatus) -> {
                                throw new EventHistoryUpstreamException(responseStatus.getStatusCode().value());
                            }
                    )
                    .body(JsonNode.class);

            return Objects.requireNonNullElseGet(response, () -> JsonNodeFactoryHolder.EMPTY_OBJECT.deepCopy());
        } catch (EventHistoryUpstreamException exception) {
            throw exception;
        } catch (RestClientException exception) {
            throw new EventHistoryUpstreamException(exception);
        }
    }

    private static void validateCursor(String cursor) {
        if (cursor == null || cursor.isBlank()) {
            return;
        }
        if (cursor.length() > MAX_CURSOR_LENGTH || CONTROL_CHARACTER.matcher(cursor).find()) {
            throw new InvalidCursorException();
        }
    }

    private static final class JsonNodeFactoryHolder {
        private static final JsonNode EMPTY_OBJECT = com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.objectNode();

        private JsonNodeFactoryHolder() {
        }
    }
}

