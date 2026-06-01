package com.apalindromestring.shipmenttracker.shipment.repositories;

import com.apalindromestring.shipmenttracker.shipment.domain.entities.CarrierLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarrierLocationRepository extends JpaRepository<CarrierLocation, Long> {
    List<CarrierLocation> findByShipment_TrackingNumberOrderByRecordedAtAsc(String trackingNumber);

}
