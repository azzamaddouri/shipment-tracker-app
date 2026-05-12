package com.apalindromestring.shipmenttracker.shipment.domain.events;

import com.apalindromestring.shipmenttracker.shipment.domain.entities.Shipment;

public record ShipmentStatusEvent(Shipment shipment) {
}
