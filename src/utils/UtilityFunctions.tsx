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
