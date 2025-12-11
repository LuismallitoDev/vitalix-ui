export interface RawProductImage {
  id_imagen: number;
  código: number;
  url: string;
}

export const getImages = async (id: number): Promise<RawProductImage[]> => {
  const response = await fetch(`http://localhost:8000/imagen/${id}`);
  
  // FIX: If 404 (Image not found), just return empty array instead of throwing error
  if (response.status === 404) {
    return [];
  }

  // Still throw for server errors (500) so React Query can retry
  if (!response.ok) {
    throw new Error('Failed to fetch images');  
  }
  console.log(response.status);
  return await response.json();
};