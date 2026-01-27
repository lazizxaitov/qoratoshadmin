export type Tour = {
  id: string;
  title: string;
  title_ru?: string;
  title_uz?: string;
  title_en?: string;
  country: string;
  country_ru?: string;
  country_uz?: string;
  country_en?: string;
  city: string;
  city_ru?: string;
  city_uz?: string;
  city_en?: string;
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
