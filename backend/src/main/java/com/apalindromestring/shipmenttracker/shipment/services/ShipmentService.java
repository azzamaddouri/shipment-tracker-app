package com.apalindromestring.shipmenttracker.shipment.services;

import com.apalindromestring.shipmenttracker.shipment.domain.dtos.CreateShipmentRequest;
import com.apalindromestring.shipmenttracker.shipment.domain.entities.Shipment;

import java.util.List;

public interface ShipmentService {

    Shipment createShipment(CreateShipmentRequest createShipmentRequest);

    List<Shipment> getAllShipments();

    Shipment getShipmentById(Long id);
}
