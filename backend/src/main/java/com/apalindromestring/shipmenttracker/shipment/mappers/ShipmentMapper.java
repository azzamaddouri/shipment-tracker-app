package com.apalindromestring.shipmenttracker.shipment.mappers;

import com.apalindromestring.shipmenttracker.shipment.domain.dtos.UpdateStatusRequest;
import com.apalindromestring.shipmenttracker.shipment.domain.entities.Shipment;
import com.apalindromestring.shipmenttracker.shipment.domain.dtos.ShipmentDto;
import com.apalindromestring.shipmenttracker.shipment.domain.dtos.CreateShipmentRequest;
import org.mapstruct.*;

@Mapper(componentModel = "spring",
        unmappedSourcePolicy = ReportingPolicy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ShipmentMapper {

    ShipmentDto toDto(Shipment shipment);

    CreateShipmentRequest toCreateShipmentRequest(ShipmentDto.CreateShipmentRequest dto);

    UpdateStatusRequest toUpdateStatusRequest(ShipmentDto.UpdateStatusRequest dto);

    @Mapping(target = "trackingNumber", source = "trackingNumber", qualifiedByName = "maskTrackingNumber")
    @Mapping(target = "destination", source = "destination", qualifiedByName = "extractCity")
    ShipmentDto.PublicShipmentActivityDto toPublicActivityDto(Shipment shipment);


    @Named("maskTrackingNumber")
    default String maskTrackingNumber(String trackingNumber) {
        if (trackingNumber == null || trackingNumber.length() < 6) return "...";
        return "..." + trackingNumber.substring(trackingNumber.length() - 6);
    }

    @Named("extractCity")
    default String extractCity(String destination) {
        if (destination == null || destination.isEmpty()) return "Unknown";
        return destination.split(",")[0].trim();
    }
}
