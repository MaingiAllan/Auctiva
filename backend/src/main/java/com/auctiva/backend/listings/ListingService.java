package com.auctiva.backend.listings;

import com.auctiva.backend.catalog.CatalogService;
import com.auctiva.backend.listings.dto.CreateListingRequest;
import com.auctiva.backend.listings.dto.ListingResponse;
import com.auctiva.backend.listings.dto.UpdateListingRequest;
import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class ListingService {

    private final ListingRepository listingRepository;
    private final CatalogService catalogService;

    public ListingService(ListingRepository listingRepository, CatalogService catalogService) {
        this.listingRepository = listingRepository;
        this.catalogService = catalogService;
    }

    public Listing createListing(UUID sellerId, CreateListingRequest request) {
        catalogService.findSummary(request.deviceModelId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Unknown device model id: " + request.deviceModelId()));

        Listing listing = new Listing(
                sellerId,
                request.deviceModelId(),
                request.title(),
                request.description(),
                request.conditionGrade(),
                request.price(),
                request.currency(),
                request.location(),
                request.imei1(),
                request.imei2(),
                request.serialNumber()
        );
        return listingRepository.save(listing);
    }

    public List<Listing> browseActiveListings(UUID deviceModelId, BigDecimal minPrice, BigDecimal maxPrice) {
        List<Listing> listings = deviceModelId != null
                ? listingRepository.findByDeviceModelIdAndStatus(deviceModelId, ListingStatus.ACTIVE)
                : listingRepository.findByStatus(ListingStatus.ACTIVE);

        // In-memory filtering is fine at MVP scale. Once volume grows, this range
        // filter moves to the `search` module's indexed query instead.
        return listings.stream()
                .filter(l -> minPrice == null || l.getPrice().compareTo(minPrice) >= 0)
                .filter(l -> maxPrice == null || l.getPrice().compareTo(maxPrice) <= 0)
                .toList();
    }

    public Listing getListingOrThrow(UUID id) {
        return listingRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Listing not found: " + id));
    }

    public Listing updateListing(UUID id, UUID requesterId, boolean isAdmin, UpdateListingRequest request) {
        Listing listing = getListingOrThrow(id);
        requireOwnerOrAdmin(listing, requesterId, isAdmin);
        listing.updateDetails(request.title(), request.description(), request.price(), request.location());
        return listing;
    }

    public void removeListing(UUID id, UUID requesterId, boolean isAdmin) {
        Listing listing = getListingOrThrow(id);
        requireOwnerOrAdmin(listing, requesterId, isAdmin);
        listing.remove();
    }

    public ListingResponse toResponse(Listing listing) {
        var deviceModel = catalogService.findSummary(listing.getDeviceModelId()).orElse(null);
        return ListingResponse.from(listing, deviceModel);
    }

    private void requireOwnerOrAdmin(Listing listing, UUID requesterId, boolean isAdmin) {
        if (!isAdmin && !listing.getSellerId().equals(requesterId)) {
            throw new AccessDeniedException("You do not own this listing");
        }
    }
}
