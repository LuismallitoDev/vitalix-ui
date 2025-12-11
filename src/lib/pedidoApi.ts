export interface RawOrder {
    idPedido: number,
    idUsuario: number,
    nombreSucursal: string,
    idAuxiliar: number,
    idDomiciliario: number,
    fechaPedido: string,
    direccionEntrega: string,
    costoEnvio: number,
    costoPedido: number,
    listaDeProductos: Array<number>,
    totalPagar: number,
    estado: string,
}

export const getOrder = async (): Promise<RawOrder[]> => {
  const response = await fetch(`http://localhost:8080/pedido/all`);
  
  if (response.status === 404) {
    return [];
  }
  if (response.status === 500) {
    return [];
  }
  if (!response.ok) {
    throw new Error('Failed to fetch images')
  }
  return await response.json();
};