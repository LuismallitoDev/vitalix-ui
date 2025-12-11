// src/lib/types/orders.d.ts

// --- USUARIO ---
export interface UsuarioDTO {
  idUsuario?: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password?: string;
  direccion: string;
  fechaRegistro: string;
  estado?: string | boolean; 
}

// --- SUCURSAL ---
export interface SucursalDTO {
  idSucursal?: number; // Recomendado: Ajustar este también si tu DB usa idSucursal
  nombre: string;
  direccion: string;
  ciudad: string;
  horarioApertura: string;
  horarioCierre: string;
}

// --- PEDIDO ---
export interface PedidoDTO {
  idPedido?: number; // Ajustado a idPedido para consistencia
  idUsuario: number;
  nombreSucursal: string | "Vitalix Plus - El Rode";
  idAuxiliar?: number | 1;
  idDomiciliario?: number | 1;
  fechaPedido: string;
  direccionEntrega: string;
  costoEnvio: number;
  costoPedido: number;
  listaDeProductos: number[];
  totalPagar: number;
  estado: string | "PENDIENTE";
}

// --- DOMICILIARIO ---
export interface DomiciliarioDTO {
  idDomiciliario?: number; // Ajustado
  nombre: string;
  apellido: string;
  telefono: string;
  placaVehiculo: string;
  idSucursal: number;
}

// --- AUXILIAR ---
export interface AuxiliarDTO {
  idAuxiliar?: number; // Ajustado
  nombre: string;
  apellido: string;
  telefono: string;
  idSucursal: number;
}

export interface OrderItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
}

export interface PedidoDTO {
  idPedido?: number;
  idUsuario: number;
  nombreSucursal?: string;
  idAuxiliar?: number;
  idDomiciliario?: number;
  fechaPedido?: string;
  direccionEntrega?: string;
  costoEnvio?: number;
  costoPedido?: number;
  // El backend espera una lista de IDs de productos (según tu código anterior)
  listaDeProductos: number[]; 
  totalPagar: number;
  estado?: string;
}