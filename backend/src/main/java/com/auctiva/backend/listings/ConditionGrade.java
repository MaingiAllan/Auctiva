package com.auctiva.backend.listings;

/**
 * MVP grading — seller-declared only. Once the `inspections` module exists, listings
 * will also carry a separately-verified grade rather than trusting this alone.
 */
public enum ConditionGrade {
    A_PLUS,
    A,
    B_PLUS,
    B,
    C,
    D,
    PARTS_ONLY
}
