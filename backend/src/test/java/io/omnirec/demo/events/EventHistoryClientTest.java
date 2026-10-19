package io.omnirec.demo.events;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class EventHistoryClientTest {

    @Test
    void requestsOnlyTheFixedCustomerWithTheServerSideSecret() {
        var builder = RestClient.builder().baseUrl("http://collector.test");
        var server = MockRestServiceServer.bindTo(builder).build();
        var client = new EventHistoryClient(
                builder.build(),
                new EventHistoryProperties("http://collector.test", "sk_demo_history", "demo_customer_123")
        );

        server.expect(requestTo(
                        "http://collector.test/v1/customers/demo_customer_123/events?limit=100&cursor=cursor_123"
                ))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer sk_demo_history"))
                .andRespond(withSuccess(
                        "{\"customerId\":\"demo_customer_123\",\"events\":[]}",
                        MediaType.APPLICATION_JSON
                ));

        var response = client.getStoredEvents("cursor_123");

        assertThat(response.path("customerId").asText()).isEqualTo("demo_customer_123");
        assertThat(response.path("events").isArray()).isTrue();
        server.verify();
    }

    @Test
    void refusesToReadHistoryWithoutASecret() {
        var client = new EventHistoryClient(
                RestClient.create("http://collector.test"),
                new EventHistoryProperties("http://collector.test", "", "demo_customer_123")
        );

        assertThatThrownBy(() -> client.getStoredEvents(null))
                .isInstanceOf(EventHistoryNotConfiguredException.class);
    }

    @Test
    void rejectsControlCharactersInAnOpaqueCursor() {
        var client = new EventHistoryClient(
                RestClient.create("http://collector.test"),
                new EventHistoryProperties("http://collector.test", "sk_demo_history", "demo_customer_123")
        );

        assertThatThrownBy(() -> client.getStoredEvents("bad\ncursor"))
                .isInstanceOf(InvalidCursorException.class);
    }
}

