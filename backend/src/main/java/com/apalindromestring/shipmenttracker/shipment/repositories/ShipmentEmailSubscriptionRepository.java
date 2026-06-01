package com.apalindromestring.shipmenttracker.shipment.repositories;

import com.apalindromestring.shipmenttracker.shipment.domain.entities.Shipment;
import com.apalindromestring.shipmenttracker.shipment.domain.entities.ShipmentEmailSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShipmentEmailSubscriptionRepository
        extends JpaRepository<ShipmentEmailSubscription, Long> {

    boolean existsByShipmentAndEmail(Shipment shipment, String email);

    List<ShipmentEmailSubscription> findByShipment(Shipment shipment);
}
