package com.auctiva.backend.listings;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.math.BigDecimal;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class ListingInventoryTest {

    @Test
    void reservationCanBeReleasedAfterFailedPayment() {
        Listing listing = listing();
        UUID orderId = UUID.randomUUID();

        listing.reserve(orderId);
        assertEquals(ListingStatus.RESERVED, listing.getStatus());
        assertEquals(orderId, listing.getReservedOrderId());

        listing.releaseReservation(orderId);
        assertEquals(ListingStatus.ACTIVE, listing.getStatus());
        assertNull(listing.getReservedOrderId());
    }

    @Test
    void onlyTheOwningOrderCanMarkItsReservationSold() {
        Listing listing = listing();
        UUID orderId = UUID.randomUUID();
        listing.reserve(orderId);

        assertThrows(IllegalStateException.class, () -> listing.markSold(UUID.randomUUID()));
        listing.markSold(orderId);
        assertEquals(ListingStatus.SOLD, listing.getStatus());
        assertNull(listing.getReservedOrderId());
    }

    @Test
    void legacyConfirmedPaymentOnlySellsAnActiveListing() {
        Listing listing = listing();
        listing.markSoldAfterLegacyPayment();
        assertEquals(ListingStatus.SOLD, listing.getStatus());

        assertThrows(IllegalStateException.class, listing::markSoldAfterLegacyPayment);
    }

    private static Listing listing() {
        return new Listing(UUID.randomUUID(), UUID.randomUUID(), "Test phone", null, ListingType.FAIRLY_USED,
                ConditionGrade.A, new BigDecimal("1000.00"), "KES", null, null, null, null);
    }
}
