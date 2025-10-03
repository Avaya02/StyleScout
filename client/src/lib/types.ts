
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image_url: string;
  product_url: string;
}

export interface ApiResponse {
  [category: string]: Product[];
}

export interface ResultsDisplayProps {
  results: ApiResponse | null;
  isLoading: boolean;
  imagePreview: string | null;
}