package com.auctiva.backend.listings;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ListingImageService {

    private static final int MAX_IMAGES = 8;
    private static final long MAX_BYTES = 5L * 1024 * 1024;
    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "image/webp");

    private final ListingService listingService;
    private final ListingImageRepository imageRepository;
    private final Path storageDirectory;

    public ListingImageService(
            ListingService listingService,
            ListingImageRepository imageRepository,
            @Value("${auctiva.image-storage-dir:./uploads}") String storageDirectory) {
        this.listingService = listingService;
        this.imageRepository = imageRepository;
        this.storageDirectory = Path.of(storageDirectory).toAbsolutePath().normalize();
    }

    @Transactional
    public List<String> upload(UUID listingId, UUID sellerId, List<MultipartFile> files) throws IOException {
        Listing listing = listingService.getListingOrThrow(listingId);
        if (!listing.getSellerId().equals(sellerId)) {
            throw new AccessDeniedException("You do not own this listing");
        }

        List<ListingImage> existing = imageRepository.findByListingIdOrderBySortOrderAsc(listingId);
        if (files.isEmpty() || existing.size() + files.size() > MAX_IMAGES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A listing can have up to 8 photos.");
        }

        List<Path> savedFiles = new ArrayList<>();
        List<ListingImage> newImages = new ArrayList<>();
        try {
            Files.createDirectories(storageDirectory);
            for (MultipartFile file : files) {
                String contentType = file.getContentType();
                if (file.isEmpty() || contentType == null || !ALLOWED_TYPES.contains(contentType)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use JPEG, PNG or WebP photos.");
                }
                if (file.getSize() > MAX_BYTES) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Each photo must be under 5MB.");
                }

                UUID imageId = UUID.randomUUID();
                String extension = switch (contentType) {
                    case "image/jpeg" -> ".jpg";
                    case "image/png" -> ".png";
                    default -> ".webp";
                };
                String storageKey = listingId + "/" + imageId + extension;
                Path destination = storageDirectory.resolve(storageKey).normalize();
                if (!destination.startsWith(storageDirectory)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid photo path.");
                }
                Files.createDirectories(destination.getParent());
                Files.copy(file.getInputStream(), destination);
                savedFiles.add(destination);
                ListingImage image = new ListingImage(listingId, storageKey, contentType, existing.size() + newImages.size());
                imageRepository.save(image);
                newImages.add(image);
            }
        } catch (IOException | RuntimeException error) {
            for (Path savedFile : savedFiles) Files.deleteIfExists(savedFile);
            throw error;
        }
        return imageUrls(listingId);
    }

    public List<String> imageUrls(UUID listingId) {
        return imageRepository.findByListingIdOrderBySortOrderAsc(listingId).stream()
                .map(image -> "/api/listings/" + listingId + "/images/" + image.getId())
                .toList();
    }

    public StoredImage getImage(UUID listingId, UUID imageId) {
        ListingImage image = imageRepository.findByIdAndListingId(imageId, listingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Path imagePath = storageDirectory.resolve(image.getStorageKey()).normalize();
        if (!imagePath.startsWith(storageDirectory) || !Files.isRegularFile(imagePath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return new StoredImage(imagePath, image.getContentType());
    }

    public record StoredImage(Path path, String contentType) { }
}