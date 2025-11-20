export interface RawProductImage {
  id_imagen: number;
  código: number;
  url: string;
}

export const getImages = async (id: number): Promise<RawProductImage[]> => {
  // This fetches from your backend based on the product ID
  const response = await fetch(`http://localhost:8000/imagen/${id}`);
  
  if (!response.ok) {
    // If 404 or error, we can throw. The useQuery will catch it and we show fallback image.
    throw new Error('Failed to fetch images');
  }
  return await response.json();
};