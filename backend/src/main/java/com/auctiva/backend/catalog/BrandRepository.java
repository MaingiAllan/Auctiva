package com.auctiva.backend.catalog;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepository extends JpaRepository<Brand, UUID> {

    Optional<Brand> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
