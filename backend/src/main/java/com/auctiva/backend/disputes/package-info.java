/**
 * Dispute intake, evidence collection, resolution workflow.
 *
 * Module boundary: no other module may access this package's repositories or entities
 * directly. Expose a service/DTO surface if another module needs this data, and prefer
 * domain events (see common.events) when eventual consistency is acceptable.
 */
package com.auctiva.backend.disputes;
