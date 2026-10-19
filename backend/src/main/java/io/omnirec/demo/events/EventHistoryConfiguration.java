package io.omnirec.demo.events;

import java.time.Duration;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(EventHistoryProperties.class)
class EventHistoryConfiguration {

    @Bean
    RestClient omnirecHistoryRestClient(
            RestClient.Builder builder,
            EventHistoryProperties properties
    ) {
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(3));
        requestFactory.setReadTimeout(Duration.ofSeconds(5));

        return builder
                .baseUrl(properties.eventApiUrl())
                .requestFactory(requestFactory)
                .build();
    }
}

