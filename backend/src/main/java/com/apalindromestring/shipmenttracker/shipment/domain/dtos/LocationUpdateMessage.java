package com.apalindromestring.shipmenttracker.shipment.domain.dtos;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationUpdateMessage {
    private String trackingNumber;
    private Double latitude;
    private Double longitude;
    private String label;
    private LocalDateTime recordedAt;
}