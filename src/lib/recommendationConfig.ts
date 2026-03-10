export const complementaryCategoriesByName: Record<string, string[]> = {
  // Everyday laundry often pairs with deeper care services
  "Laundry": ["Dry Cleaning", "Party & Occasion Wear", "Carpets & Rugs"],
  "Dry Cleaning": ["Party & Occasion Wear", "Leather Care", "Laundry"],
  "Party & Occasion Wear": ["Dry Cleaning", "Leather Care", "Laundry"],
  "Leather Care": ["Dry Cleaning", "Party & Occasion Wear"],
  "Sofa Care": ["Carpets & Rugs", "Laundry"],
  "Carpets & Rugs": ["Sofa Care", "Laundry"],
};

export const recommendationWeights = {
  complementaryCategory: 3,
  frequentCategory: 2,
  frequentService: 2,
  sameCategory: 1,
};

export function getComplementaryCategoryNames(cartCategoryNames: string[]): Set<string> {
  const result = new Set<string>();
  for (const name of cartCategoryNames) {
    const matches = complementaryCategoriesByName[name];
    if (matches) {
      matches.forEach((m) => result.add(m));
    }
  }
  return result;
}

