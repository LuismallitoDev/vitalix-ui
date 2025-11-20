
export interface RawProduct {
  código: number;
  descripción: string;
  "s._ent": number;       
  "s._fracc": number;    
  "1%": number;          
  "2%": number;           
  "3%": number;           
  costo: number;        
  "total_c._compra": number; 
  "%_iva_c": number;      
  utilidad: number;       
  precio_neto: number;    
  total_precio: number;   
}

export const getProducts = async (): Promise<RawProduct[]> => {
  
  const response = await fetch('http://localhost:8000/inventario');
  
  if (!response.ok) {
    throw new Error('Failed to fetch inventory');
  }
  
  return await response.json();
};