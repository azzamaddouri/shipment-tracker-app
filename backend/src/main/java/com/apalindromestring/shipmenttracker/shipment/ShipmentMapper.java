package com.apalindromestring.shipmenttracker.shipment;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        unmappedSourcePolicy = ReportingPolicy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ShipmentMapper {

    ShipmentDTO.ShipmentResponse toDto(Shipment shipment);

    Shipment toEntity(ShipmentDTO.CreateShipmentRequest request);
}
