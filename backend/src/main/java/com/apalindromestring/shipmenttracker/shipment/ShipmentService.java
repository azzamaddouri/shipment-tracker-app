package com.apalindromestring.shipmenttracker.shipment;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentMapper shipmentMapper;

    public Shipment createShipment(Shipment shipment) {
        String trackingNumber = generateTrackingNumber();
        shipment.setTrackingNumber(trackingNumber);
        return shipmentRepository.save(shipment);
    }


    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }


    private String generateTrackingNumber() {
        return "TRK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
