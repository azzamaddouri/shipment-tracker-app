package com.apalindromestring.shipmenttracker.shipment.domain.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateShipmentRequest {
    private String origin;
    private String destination;
    private String estimatedDelivery;
}
