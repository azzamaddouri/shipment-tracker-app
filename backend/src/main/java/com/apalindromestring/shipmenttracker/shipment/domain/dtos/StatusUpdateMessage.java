package com.apalindromestring.shipmenttracker.shipment.domain.dtos;

import com.apalindromestring.shipmenttracker.shipment.domain.ShipmentStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateMessage {
    public Long ShipmentId;
    public String trackingNumber;
    public ShipmentStatus status;
    public String currentLocation;
    public LocalDateTime timestamp;
    public String message;
}
