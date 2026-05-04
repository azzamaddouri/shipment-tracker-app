package com.apalindromestring.shipmenttracker.shipment.mappers;

import com.apalindromestring.shipmenttracker.shipment.domain.entities.Shipment;
import com.apalindromestring.shipmenttracker.shipment.domain.dtos.ShipmentDto;
import com.apalindromestring.shipmenttracker.shipment.domain.dtos.CreateShipmentRequest;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        unmappedSourcePolicy = ReportingPolicy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ShipmentMapper {

    ShipmentDto toDto(Shipment shipment);

    CreateShipmentRequest toCreateShipmentRequest(ShipmentDto.CreateShipmentRequest dto);

}
