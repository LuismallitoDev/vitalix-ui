import { 
  UsuarioDTO, 
  SucursalDTO, 
  PedidoDTO, 
  DomiciliarioDTO, 
  AuxiliarDTO 
} from "./types"; 

const BASE_URL = "http://localhost:8080";

async function _request<T>(endpoint: string, method: string, body?: any): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body !== undefined) {
    // Si es un string simple (para el cambio de estado), lo enviamos como JSON string
    // Ejemplo: "CANCELADO" viaja como "\"CANCELADO\"" que es un JSON válido
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error ${response.status}:`, errorText);
      throw new Error(errorText || `Error ${response.status}`);
    }

    const text = await response.text();
    if (!text) return {} as T;

    try {
      return JSON.parse(text);
    } catch (e) {
      console.warn("⚠️ Respuesta no es JSON, aceptando texto plano:", text);
      return { message: text } as unknown as T; 
    }
    
  } catch (error) {
    console.error("🔥 Error de Red/Fetch:", error);
    throw error;
  }
}

export const UserApi = {
  getAll: () => _request<UsuarioDTO[]>("/usuario/all", "GET"),
  getById: (id: number) => _request<UsuarioDTO>(`/usuario/${id}`, "GET"),
  login: (id: number) => _request<UsuarioDTO>(`/usuario/login/${id}`, "GET"),
  create: (data: UsuarioDTO) => _request<UsuarioDTO>("/usuario", "POST", data),
  update: (id: number, data: UsuarioDTO) => _request<UsuarioDTO>(`/usuario/update/${id}`, "PUT", data),
  changeStatus: (id: number) => _request<void>(`/usuario/change-status/${id}`, "PUT"),
  getPassword: (id: number) => _request<string>(`/usuario/login/${id}`, "GET"),
};

export const BranchApi = {
  getAll: () => _request<SucursalDTO[]>("/sucursal/all", "GET"),
  getById: (id: number) => _request<SucursalDTO>(`/sucursal/${id}`, "GET"),
  searchByName: (nombre: string) => _request<SucursalDTO[]>(`/sucursal/buscar/${encodeURIComponent(nombre)}`, "GET"),
  create: (data: SucursalDTO) => _request<SucursalDTO>("/sucursal", "POST", data),
  update: (id: number, data: SucursalDTO) => _request<SucursalDTO>(`/sucursal/update/${id}`, "PUT", data),
  changeStatus: (id: number) => _request<void>(`/sucursal/change-status/${id}`, "PUT"),
};

export const OrderApi = {
  getAll: () => _request<PedidoDTO[]>("/pedido/all", "GET"),
  getById: (id: number) => _request<PedidoDTO>(`/pedido/${id}`, "GET"),
  create: (data: PedidoDTO) => _request<PedidoDTO>("/pedido", "POST", data),
  
  // Endpoint general para datos (montos, direccion, asignaciones)
  update: (id: number, data: PedidoDTO) => _request<PedidoDTO>(`/pedido/update/${id}`, "PUT", data),
  
  // Endpoint ESPECÍFICO para estado. Recibe el string del estado en mayúsculas.
  changeStatus: (id: number, nuevoEstado: string) => 
    _request<void>(`/pedido/change-status/${id}`, "PUT", nuevoEstado),
};

export const DriverApi = {
  getAll: () => _request<DomiciliarioDTO[]>("/domiciliario/all", "GET"),
  getById: (id: number) => _request<DomiciliarioDTO>(`/domiciliario/${id}`, "GET"),
  create: (data: DomiciliarioDTO) => _request<DomiciliarioDTO>("/domiciliario", "POST", data),
  update: (id: number, data: DomiciliarioDTO) => _request<DomiciliarioDTO>(`/domiciliario/update/${id}`, "PUT", data),
  changeStatus: (id: number) => _request<void>(`/domiciliario/change-status/${id}`, "PUT"),
};

export const AssistantApi = {
  getAll: () => _request<AuxiliarDTO[]>("/auxiliar/all", "GET"),
  getById: (id: number) => _request<AuxiliarDTO>(`/auxiliar/${id}`, "GET"),
  create: (data: AuxiliarDTO) => _request<AuxiliarDTO>("/auxiliar", "POST", data),
  update: (id: number, data: AuxiliarDTO) => _request<AuxiliarDTO>(`/auxiliar/update/${id}`, "PUT", data),
  changeStatus: (id: number) => _request<void>(`/auxiliar/change-status/${id}`, "PUT"),
};