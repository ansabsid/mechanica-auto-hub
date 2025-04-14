
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
  readonly retailer_id: string | null;
  readonly source_type: 'garage' | 'retailer' | null;
  readonly garages: {
    readonly name: string;
    readonly location: string;
  } | null;
  readonly image_url: string | null;
  readonly availableGarages?: ReadonlyArray<Garage>;
}
