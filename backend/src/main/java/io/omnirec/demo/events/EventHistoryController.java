package io.omnirec.demo.events;

import com.fasterxml.jackson.databind.JsonNode;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events")
public class EventHistoryController {
    private final EventHistoryClient historyClient;

    EventHistoryController(EventHistoryClient historyClient) {
        this.historyClient = historyClient;
    }

    @GetMapping
    ResponseEntity<JsonNode> getEvents(@RequestParam(required = false) String cursor) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(historyClient.getStoredEvents(cursor));
    }
}

