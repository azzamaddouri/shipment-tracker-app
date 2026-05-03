package com.apalindromestring.shipmenttracker.shipment;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

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
}
