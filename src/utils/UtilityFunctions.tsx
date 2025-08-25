export const getAmenity = (): {
  checkBoxAmenities: Amenity[];
  radioButtonAmenities: Amenity[];
} => {
  const totalAmenities: { id: string; amenity: string }[] = JSON.parse(
    localStorage.getItem("amenities"),
  );
  const checkBoxAmenities: Amenity[] = totalAmenities.filter(
    (item) => !item.amenity.toLowerCase().includes("furnished"),
  );
  const radioButtonAmenities: Amenity[] = totalAmenities.filter((item) =>
    item.amenity.toLowerCase().includes("furnished"),
  );
  return { checkBoxAmenities, radioButtonAmenities };
};

// Add share property function with notification
export const shareProperty = async (
  propertyTitle: string,
  propertyId: string,
  createNotification: (message: string, type?: "user" | "property", propertyId?: string) => Promise<boolean>
) => {
  try {
    // Create shareable URL
    const shareUrl = `${window.location.origin}/properties/${propertyId}`;
    
    // Try to use native sharing if available
    if (navigator.share) {
      await navigator.share({
        title: propertyTitle,
        text: `Check out this property: ${propertyTitle}`,
        url: shareUrl,
      });
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareUrl);
    }

    // Create notification for share action
    await createNotification(
      `You shared the property "${propertyTitle}"`,
      "property",
      propertyId
    );

    return true;
  } catch (error) {

    return false;
  }
};
