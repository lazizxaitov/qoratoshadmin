export type Tour = {
  id: string;
  title: string;
  country: string;
  city: string;
  start_date: string;
  end_date: string;
  adults_min: number;
  adults_max: number;
  price_from: number;
  nights: number;
  image_url: string;
  is_hot: number;
  tour_type?: string;
  gallery_urls?: string[];
};

export type ContentMap = Record<string, unknown>;
