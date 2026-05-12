package com.apalindromestring.shipmenttracker.shipment.domain.dtos;

import com.apalindromestring.shipmenttracker.shipment.domain.enums.ShipmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentDto {

    public Long id;
    public String trackingNumber;
    public String origin;
    public String destination;
    public ShipmentStatus status;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
    public String currentLocation;
    public String estimatedDelivery;


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
    public static class UpdateStatusRequest {
        @NotNull(message = "Status is required")
        public ShipmentStatus status;
        public String currentLocation;
    }
}