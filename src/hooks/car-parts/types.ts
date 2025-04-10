
// Common types for car parts functionality
export interface Manufacturer {
  id: number;
  name: string;
}

export interface Model {
  id: number;
  manufacturer_id: number;
  name: string;
}

export interface Part {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  manufacturer_id: number;
  model_id: number;
  year: number;
  garage_id: string | null;
  garages: {
    name: string;
    location: string;
  } | null;
}

// Search state interface
export interface CarPartsSearchState {
  manufacturers: Manufacturer[];
  models: Model[];
  parts: Part[];
  years: number[];
  isLoading: boolean;
  isSearching: boolean;
  searchCompleted: boolean;
}
