package com.apalindromestring.shipmenttracker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        // Client -> Server
        /*
          1. Client sends to /app
          2. Spring finds @MessageMapping controller
          3. Controller method handles it
         */
        registry.setApplicationDestinationPrefixes("/app");

        // Server -> Specific Client
        /*
          1. Server sends to /user/john/queue/notifications
          2. Broker finds the session belonging to "john"
          3. Only John receives it, nobody else
         */
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {

        // Broker Endpoint 1 - SockJs (uses http://)

        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:4200").withSockJS();


        // Broker Endpoint 2 - Raw WebSocket (uses ws://)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:4200");
    }
}
