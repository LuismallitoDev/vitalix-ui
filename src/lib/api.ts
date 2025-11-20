
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

// Tipos para Pedidos
export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  fecha: string;
  cliente_email: string;
  cliente_nombre: string;
  total: number;
  estado: 'Pendiente' | 'Aceptado' | 'Rechazado';
  items: OrderItem[];
}

// --- API CALLS ---

export const createOrder = async (orderData: { user_email: string, user_name: string, total: number, items: OrderItem[] }) => {
    const response = await fetch('http://localhost:8000/inventario/pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error('Error al crear pedido');
    return await response.json();
};

export const getOrders = async (): Promise<Order[]> => {
    const response = await fetch('http://localhost:8000/inventario/pedidos');
    if (!response.ok) throw new Error('Error al obtener pedidos');
    return await response.json();
};

export const updateOrderStatus = async (orderId: number, status: string) => {
    const response = await fetch(`http://localhost:8000/inventario/pedido/${orderId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Error actualizando estado');
    return await response.json();
};

// ... (Mantén getProducts y getImages si los usas para mostrar la tienda)