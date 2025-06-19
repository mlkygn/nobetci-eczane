import { useEffect, useState } from "react";

// Genel sıralama fonksiyonu
function applySort(list, sortField, sortOrder) {
  return [...list].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];

    if (typeof fieldA === "string" && typeof fieldB === "string") {
      return sortOrder === "asc"
        ? fieldA.toLowerCase().localeCompare(fieldB.toLowerCase())
        : fieldB.toLowerCase().localeCompare(fieldA.toLowerCase());
    }

    if (typeof fieldA === "number" && typeof fieldB === "number") {
      return sortOrder === "asc" ? fieldA - fieldB : fieldB - fieldA;
    }

    return 0;
  });
}

// Dinamik filtreleme fonksiyonu
function applyFilters(list, filters, schema) {
  return list.filter((item) => {
    for (const key in schema) {
      const value = filters[key];
      if (value !== undefined && value !== null) {
        const isMatch = schema[key](item, value);
        if (!isMatch) return false;
      }
    }
    return true;
  });
}

// Custom Hook
export function usePharmacyFilter(dataPharmacy, filters, userLoc) {
  const [filteredList, setFilteredList] = useState([]);

  useEffect(() => {
    const filterSchema = {
      searchTerm: (item, value) => {
        const term = value.toLowerCase();
        return (
          item.pharmacyName.toLowerCase().includes(term) ||
          item.district.toLowerCase().includes(term) ||
          item.address.toLowerCase().includes(term)
        );
      },
      selectedDistrict: (item, value) =>
        value === "" || item.district === value,
      maxDistance: (item, value) =>
        !userLoc.latitude || !item.distance || item.distance / 1000 <= value, // metre → km
    };

    const filtered = applyFilters(dataPharmacy, filters, filterSchema);
    const sorted = applySort(filtered, filters.sortField, filters.sortOrder);
    setFilteredList(sorted);
  }, [dataPharmacy, filters, userLoc]);

  return filteredList;
}
