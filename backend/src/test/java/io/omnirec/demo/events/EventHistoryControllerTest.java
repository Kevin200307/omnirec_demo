package io.omnirec.demo.events;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.function.Supplier;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.client.RestClient;

class EventHistoryControllerTest {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void returnsStoredHistoryWithoutCachingIt() throws Exception {
        JsonNode response = objectMapper.readTree("""
                {"customerId":"demo_customer_123","events":[{"event":"product_viewed"}]}
                """);
        MockMvc mockMvc = mockMvc(() -> response);

        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(jsonPath("$.customerId").value("demo_customer_123"))
                .andExpect(jsonPath("$.events[0].event").value("product_viewed"));
    }

    @Test
    void hidesUpstreamFailureDetails() throws Exception {
        MockMvc mockMvc = mockMvc(() -> {
            throw new EventHistoryUpstreamException(new IllegalStateException("secret detail"));
        });

        mockMvc.perform(get("/api/events"))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.error").value("history_unavailable"))
                .andExpect(jsonPath("$.message").value("Stored event history is temporarily unavailable."))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.not(
                        org.hamcrest.Matchers.containsString("secret detail")
                )));
    }

    @Test
    void reportsMissingServerConfiguration() throws Exception {
        MockMvc mockMvc = mockMvc(() -> {
            throw new EventHistoryNotConfiguredException();
        });

        mockMvc.perform(get("/api/events"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("history_not_configured"));
    }

    private static MockMvc mockMvc(Supplier<JsonNode> response) {
        var client = new FakeEventHistoryClient(response);
        return MockMvcBuilders.standaloneSetup(new EventHistoryController(client))
                .setControllerAdvice(new EventHistoryExceptionHandler())
                .build();
    }

    private static final class FakeEventHistoryClient extends EventHistoryClient {
        private final Supplier<JsonNode> response;

        private FakeEventHistoryClient(Supplier<JsonNode> response) {
            super(
                    RestClient.create("http://collector.test"),
                    new EventHistoryProperties("http://collector.test", "sk_test", "demo_customer_123")
            );
            this.response = response;
        }

        @Override
        public JsonNode getStoredEvents(String cursor) {
            return response.get();
        }
    }
}

