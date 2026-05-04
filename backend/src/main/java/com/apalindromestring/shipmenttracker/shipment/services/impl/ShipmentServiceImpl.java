package com.apalindromestring.shipmenttracker.shipment.services.impl;

import com.apalindromestring.shipmenttracker.shipment.repositories.ShipmentRepository;
import com.apalindromestring.shipmenttracker.shipment.domain.dtos.CreateShipmentRequest;
import com.apalindromestring.shipmenttracker.shipment.domain.entities.Shipment;
import com.apalindromestring.shipmenttracker.shipment.services.ShipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository shipmentRepository;

    public Shipment createShipment(CreateShipmentRequest createShipmentRequest) {
        Shipment newShipment = new Shipment();
        newShipment.setOrigin(createShipmentRequest.getOrigin());
        newShipment.setDestination(createShipmentRequest.getDestination());
        newShipment.setTrackingNumber(generateTrackingNumber());

        return shipmentRepository.save(newShipment);
    }


    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }

    public Shipment getShipmentById(Long id) {
        return shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id " + id));
    }

    public Shipment getShipmentByTrackingNumber(String trackingNumber) {
        return shipmentRepository.findShipmentByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new RuntimeException("Shipment not found with Tracking Number " + trackingNumber));
    }


    private String generateTrackingNumber() {
        return "TRK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }


}
