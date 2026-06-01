package com.apalindromestring.shipmenttracker.shipment.domain.events;

import com.apalindromestring.shipmenttracker.shipment.domain.entities.CarrierLocation;
import com.apalindromestring.shipmenttracker.shipment.domain.entities.Shipment;

public record CarrierLocationEvent(Shipment shipment, CarrierLocation location) {
}