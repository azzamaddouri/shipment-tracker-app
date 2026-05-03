package com.apalindromestring.shipmenttracker.shipment;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

public class ShipmentDTO {

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateShipmentRequest {
        @NotBlank(message = "Origin is required")
        public String origin;

        @NotBlank(message = "Destination is required")
        public String destination;

        public String estimatedDelivery;
    }


    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShipmentResponse {
        public Long id;
        public String trackingNumber;
        public String origin;
        public String destination;
        public ShipmentStatus status;
        public LocalDateTime createdAt;
        public LocalDateTime updatedAt;
        private String currentLocation;
        public String estimatedDelivery;
    }
}
