package com.auctiva.backend.catalog;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeviceModelRepository extends JpaRepository<DeviceModel, UUID> {

    List<DeviceModel> findByBrandId(UUID brandId);
}
