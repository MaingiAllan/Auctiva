package com.auctiva.backend.catalog;

import com.auctiva.backend.catalog.dto.DeviceModelSummary;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class CatalogService {

    private final BrandRepository brandRepository;
    private final DeviceModelRepository deviceModelRepository;

    public CatalogService(BrandRepository brandRepository, DeviceModelRepository deviceModelRepository) {
        this.brandRepository = brandRepository;
        this.deviceModelRepository = deviceModelRepository;
    }

    public List<Brand> listBrands() {
        return brandRepository.findAll();
    }

    public Brand createBrand(String name) {
        if (brandRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Brand already exists: " + name);
        }
        return brandRepository.save(new Brand(name));
    }

    public List<DeviceModel> listDeviceModels(UUID brandId, Category category) {
        return deviceModelRepository.findAll().stream()
                .filter(model -> brandId == null || model.getBrand().getId().equals(brandId))
                .filter(model -> category == null || model.getCategory().equals(category.name()))
                .toList();
    }

    public DeviceModel createDeviceModel(
            UUID brandId, String name, String variant, Integer releaseYear, Category category) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new IllegalArgumentException("Unknown brand id: " + brandId));
        return deviceModelRepository.save(new DeviceModel(brand, name, variant, releaseYear, category));
    }

    /** The one thing other modules (e.g. listings) are allowed to call. */
    public Optional<DeviceModelSummary> findSummary(UUID deviceModelId) {
        return deviceModelRepository.findById(deviceModelId).map(DeviceModelSummary::from);
    }
}
