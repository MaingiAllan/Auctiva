package com.auctiva.backend.listings;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ListingRepository extends JpaRepository<Listing, UUID> {

    List<Listing> findByStatus(ListingStatus status);

    List<Listing> findByDeviceModelIdAndStatus(UUID deviceModelId, ListingStatus status);

    List<Listing> findBySellerId(UUID sellerId);
}
