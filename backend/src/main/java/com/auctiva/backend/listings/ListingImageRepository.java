package com.auctiva.backend.listings;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ListingImageRepository extends JpaRepository<ListingImage, UUID> {
    List<ListingImage> findByListingIdOrderBySortOrderAsc(UUID listingId);
    Optional<ListingImage> findByIdAndListingId(UUID id, UUID listingId);
}