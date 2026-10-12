package com.auctiva.backend.catalog;

import com.auctiva.backend.catalog.dto.BrandResponse;
import com.auctiva.backend.catalog.dto.CreateBrandRequest;
import com.auctiva.backend.catalog.dto.CreateDeviceModelRequest;
import com.auctiva.backend.catalog.dto.DeviceModelResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * GET endpoints here are public (see SecurityConfig). POST endpoints require the
 * ADMIN role — this is reference/catalog data, not something any buyer/seller edits.
 */
@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/brands")
    public List<BrandResponse> listBrands() {
        return catalogService.listBrands().stream().map(BrandResponse::from).toList();
    }

    @PostMapping("/brands")
    public ResponseEntity<BrandResponse> createBrand(@Valid @RequestBody CreateBrandRequest request) {
        Brand brand = catalogService.createBrand(request.name());
        return ResponseEntity.status(HttpStatus.CREATED).body(BrandResponse.from(brand));
    }

    @GetMapping("/device-models")
    public List<DeviceModelResponse> listDeviceModels(@RequestParam(required = false) UUID brandId) {
        return catalogService.listDeviceModels(brandId).stream().map(DeviceModelResponse::from).toList();
    }

    @PostMapping("/device-models")
    public ResponseEntity<DeviceModelResponse> createDeviceModel(@Valid @RequestBody CreateDeviceModelRequest request) {
        DeviceModel model = catalogService.createDeviceModel(
                request.brandId(), request.name(), request.variant(), request.releaseYear());
        return ResponseEntity.status(HttpStatus.CREATED).body(DeviceModelResponse.from(model));
    }
}
