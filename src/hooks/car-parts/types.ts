
// Common types for car parts functionality

// Using readonly properties where possible to optimize React rendering
export interface Manufacturer {
  readonly id: number;
  readonly name: string;
}

export interface Model {
  readonly id: number;
  readonly manufacturer_id: number;
  readonly name: string;
}

export interface Garage {
  readonly id: string;
  readonly name: string;
  readonly location: string;
  readonly installationFee: number;
  readonly area: string;
}

export interface Part {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;
  readonly price: number;
  readonly stock: number;
  readonly manufacturer_id: number;
  readonly model_id: number;
  readonly year: number;
  readonly garage_id: string | null;
  readonly garages: {
    readonly name: string;
    readonly location: string;
  } | null;
  readonly availableGarages?: ReadonlyArray<Garage>;
  readonly image_url?: string | null;
}

// Search state interface
export interface CarPartsSearchState {
  readonly manufacturers: ReadonlyArray<Manufacturer>;
  readonly models: ReadonlyArray<Model>;
  readonly parts: ReadonlyArray<Part>;
  readonly years: ReadonlyArray<number>;
  readonly isLoading: boolean;
  readonly isSearching: boolean;
  readonly searchCompleted: boolean;
}
