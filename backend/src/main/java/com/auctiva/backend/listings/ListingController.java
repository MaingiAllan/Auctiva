package com.auctiva.backend.listings;

import com.auctiva.backend.identity.Role;
import com.auctiva.backend.identity.UserPrincipal;
import com.auctiva.backend.listings.dto.CreateListingRequest;
import com.auctiva.backend.listings.dto.ListingResponse;
import com.auctiva.backend.listings.dto.UpdateListingRequest;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** GET is public (see SecurityConfig). Create/update/remove require auth + ownership. */
@RestController
@RequestMapping("/api/listings")
public class ListingController {

    private final ListingService listingService;

    public ListingController(ListingService listingService) {
        this.listingService = listingService;
    }

    @GetMapping
    public List<ListingResponse> browse(
            @RequestParam(required = false) UUID deviceModelId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        return listingService.browseActiveListings(deviceModelId, minPrice, maxPrice)
                .stream()
                .map(listingService::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public ListingResponse getOne(@PathVariable UUID id) {
        return listingService.toResponse(listingService.getListingOrThrow(id));
    }

    @PostMapping
    public ResponseEntity<ListingResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateListingRequest request) {
        Listing listing = listingService.createListing(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(listingService.toResponse(listing));
    }

    @PatchMapping("/{id}")
    public ListingResponse update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @RequestBody UpdateListingRequest request) {
        boolean isAdmin = principal.getRole() == Role.ADMIN;
        Listing listing = listingService.updateListing(id, principal.getId(), isAdmin, request);
        return listingService.toResponse(listing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        boolean isAdmin = principal.getRole() == Role.ADMIN;
        listingService.removeListing(id, principal.getId(), isAdmin);
        return ResponseEntity.noContent().build();
    }
}
