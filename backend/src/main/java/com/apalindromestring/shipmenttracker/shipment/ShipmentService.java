package com.apalindromestring.shipmenttracker.shipment;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class ShipmentService {

    private ShipmentRepository shipmentRepository;

    public void createShipment(){
        Shipment shipment = Shipment.builder()
                .trackingNumber("TRACK12345")
                .origin("New York")
                .destination("Los Angeles")
                .build();
        shipmentRepository.save(shipment);
    }

}
