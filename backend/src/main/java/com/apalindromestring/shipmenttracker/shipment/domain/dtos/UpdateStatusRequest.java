package com.apalindromestring.shipmenttracker.shipment.domain.dtos;

import com.apalindromestring.shipmenttracker.shipment.domain.enums.ShipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateStatusRequest {

    private ShipmentStatus status;
    private String currentLocation;
}
