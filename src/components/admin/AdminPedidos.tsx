import React, { useState, useEffect, useMemo } from "react";
// Imports de API
import { OrderApi, DriverApi, AssistantApi, UserApi } from "../../lib/ordersApi";
import { getProducts } from "../../lib/api";
import { getImages } from "../../lib/imageApi";
// Imports de Tipos
import { PedidoDTO, DomiciliarioDTO, AuxiliarDTO, UsuarioDTO } from "../../lib/types";

// Iconos y UI
import { Plus, Pencil, Trash2, Search, X, Loader2, ShoppingBag, DollarSign, Calendar, Truck, User, RefreshCcw, Eye, EyeOff, MapPin, Box, Phone } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

// --- SUB-COMPONENTE: FILA DE PRODUCTO ---
const ProductRow = ({ id, quantity, allProducts }: { id: number, quantity: number, allProducts: any[] }) => {
  const productInfo = allProducts.find(p => p.código === id);
  const { data: images } = useQuery({
    queryKey: ['product-image', id],
    queryFn: () => getImages(id),
    staleTime: 1000 * 60 * 10,
  });
  const imageUrl = images && images.length > 0 ? images[0].url : "https://via.placeholder.com/50?text=No+Img";

  return (
    <div className="flex items-center gap-4 p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
      <div className="w-12 h-12 bg-slate-50 rounded-lg flex-shrink-0 flex items-center justify-center p-1 border border-slate-100 overflow-hidden">
        <img src={imageUrl} alt="prod" className="max-w-full max-h-full object-contain mix-blend-multiply" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-700 line-clamp-1">{productInfo ? productInfo.descripción : `Producto ID: ${id}`}</p>
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">ID: {id}</p>
      </div>
      <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
        <span className="text-xs font-bold text-slate-600">x{quantity}</span>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTE: VISOR DE RESUMEN ---
const OrderSummaryViewer = ({ productIds }: { productIds: number[] }) => {
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5
  });

  const groupedItems = useMemo(() => {
    const counts: Record<number, number> = {};
    productIds.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
    return Object.entries(counts).map(([id, qty]) => ({ id: Number(id), qty: qty }));
  }, [productIds]);

  if (!products) return <div className="p-4 text-center text-xs text-slate-400"><Loader2 className="animate-spin inline mr-2" /> Cargando detalles...</div>;
  if (productIds.length === 0) return <div className="p-4 text-center text-xs text-slate-400 italic bg-slate-50 rounded-xl">Sin productos asignados</div>;

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
      {groupedItems.map(item => (
        <ProductRow key={item.id} id={item.id} quantity={item.qty} allProducts={products} />
      ))}
    </div>
  );
};

const AdminPedidos = () => {
  const [orders, setOrders] = useState<PedidoDTO[]>([]);
  const [drivers, setDrivers] = useState<DomiciliarioDTO[]>([]);
  const [assistants, setAssistants] = useState<AuxiliarDTO[]>([]);
  const [users, setUsers] = useState<UsuarioDTO[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PedidoDTO | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentProductList, setCurrentProductList] = useState<number[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersData, driversData, assistantsData, usersData] = await Promise.all([
        OrderApi.getAll(),
        DriverApi.getAll(),
        AssistantApi.getAll(),
        UserApi.getAll()
      ]);
      setOrders(Array.isArray(ordersData) ? ordersData.sort((a, b) => (b.idPedido || 0) - (a.idPedido || 0)) : []);
      setDrivers(Array.isArray(driversData) ? driversData : []);
      setAssistants(Array.isArray(assistantsData) ? assistantsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      toast.error("Error de conexión");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (editingOrder) setCurrentProductList(editingOrder.listaDeProductos || []);
    else setCurrentProductList([]);
  }, [editingOrder]);

  const getDriverName = (id?: number) => {
    if (!id) return "Sin Asignar";
    const driver = drivers.find(d => d.idDomiciliario === id);
    return driver ? `${driver.nombre} ${driver.apellido}` : `ID: ${id}`;
  };

  const getAssistantName = (id?: number) => {
    if (!id) return "Sin Asignar";
    const assistant = assistants.find(a => a.idAuxiliar === id);
    return assistant ? `${assistant.nombre} ${assistant.apellido}` : `ID: ${id}`;
  };

  const getUserName = (id: number) => {
    const user = users.find(u => u.idUsuario === id);
    return user ? `${user.nombre} ${user.apellido}` : `Cliente #${id}`;
  };

  // --- NUEVO HELPER: OBTENER TELÉFONO ---
  const getUserPhone = (id?: number) => {
    if (!id) return "";
    const user = users.find(u => u.idUsuario === id);
    return user?.telefono || "No registrado";
  };

  const handleChangeStatus = async (id: number, estadoActual: string) => {
    const esBorrado = estadoActual === "BORRADO";
    const nuevoEstado = esBorrado ? "PENDIENTE" : "BORRADO";
    const accion = esBorrado ? "RESTAURAR" : "ELIMINAR";
    if (!window.confirm(`¿${accion} este pedido?`)) return;
    try {
      await OrderApi.changeStatus(id, nuevoEstado);
      toast.success(esBorrado ? "Pedido restaurado" : "Pedido eliminado");
      fetchData();
    } catch (error) { toast.error("Error al cambiar estado."); }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productosArray = currentProductList;

    const idDom = Number(formData.get("idDomiciliario"));
    const idAux = Number(formData.get("idAuxiliar"));
    const idUsu = Number(formData.get("idUsuario"));
    const estadoForm = (formData.get("estado") as string).toUpperCase();
    const estadoOriginal = editingOrder?.estado || "PENDIENTE";

    if (!idDom || !idAux) { toast.error("Asigna Domiciliario y Auxiliar"); return; }

    const payload = {
      idPedido: editingOrder?.idPedido,
      idUsuario: idUsu,
      nombreSucursal: formData.get("nombreSucursal"),
      idSucursal: (editingOrder as any)?.idSucursal || 0,
      idAuxiliar: idAux,
      idDomiciliario: idDom,
      fechaPedido: formData.get("fechaPedido"),
      direccionEntrega: formData.get("direccionEntrega"),
      costoEnvio: Number(formData.get("costoEnvio")),
      costoPedido: Number(formData.get("costoPedido")),
      totalPagar: Number(formData.get("totalPagar")),
      listaDeProductos: productosArray,
      estado: editingOrder ? estadoOriginal : estadoForm,
      domiciliario: { idDomiciliario: idDom },
      auxiliar: { idAuxiliar: idAux },
      sucursal: { idSucursal: (editingOrder as any)?.idSucursal || 0 },
      usuario: { idUsuario: idUsu }
    };

    try {
      if (editingOrder?.idPedido) {
        await OrderApi.update(editingOrder.idPedido, payload as any);
        if (estadoOriginal !== estadoForm) await OrderApi.changeStatus(editingOrder.idPedido, estadoForm);
        toast.success("Pedido actualizado");
      } else {
        await OrderApi.create({ ...payload, estado: estadoForm } as any);
        toast.success("Pedido creado");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) { toast.error("Error al guardar"); }
  };

  const handleProductListChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const ids = val.split(",").map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0);
    setCurrentProductList(ids);
  };

  const filteredOrders = orders.filter(o => {
    if (!showDeleted && o.estado === "BORRADO") return false;
    return (o.idPedido?.toString() || "").includes(searchTerm) || (o.nombreSucursal || "").toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (s: string = "") => {
    switch (s.toUpperCase()) {
      case "ENTREGADO": case "ACEPTADO": return "bg-green-100 text-green-700 border-green-200";
      case "BORRADO": case "RECHAZADO": case "CANCELADO": return "bg-red-100 text-red-700 border-red-200";
      case "PENDIENTE": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Pedidos</h2>
          <p className="text-slate-500 text-sm">Gestiona y asigna las órdenes de servicio</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowDeleted(!showDeleted)} className={`p-2.5 rounded-xl border transition-all ${showDeleted ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`} title={showDeleted ? "Ocultar Eliminados" : "Ver Eliminados"}>
            {showDeleted ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button onClick={() => { setEditingOrder(null); setIsModalOpen(true); }} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-slate-900/20 transition-all">
            <Plus size={18} /> Nuevo Pedido
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative mb-6 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" size={20} />
        <input type="text" placeholder="Buscar por ID, sucursal..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all shadow-sm" />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Pedido / Fecha</th>
                <th className="px-6 py-4">Asignación</th>
                <th className="px-6 py-4">Detalles</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (<tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" /></td></tr>) :
                filteredOrders.map((o) => (
                  <tr key={o.idPedido} className={`group hover:bg-slate-50/80 transition-colors ${o.estado === 'BORRADO' ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">#{o.idPedido}</div>
                        <div>
                          <div className="font-semibold text-slate-900">{getUserName(o.idUsuario)}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={10} /> {o.fechaPedido}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg w-fit border border-blue-100">
                          <Truck size={12} /> Dom: {getDriverName(o.idDomiciliario)}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg w-fit border border-purple-100">
                          <User size={12} /> Aux: {getAssistantName(o.idAuxiliar)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1"><DollarSign size={14} className="text-slate-400" /> {(o.totalPagar || 0).toLocaleString('es-CO')}</div>
                      <div className="text-xs text-slate-500 mt-1 truncate max-w-[140px] flex items-center gap-1"><MapPin size={10} /> {o.nombreSucursal}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border tracking-wide ${getStatusColor(o.estado)}`}>{o.estado}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingOrder(o); setIsModalOpen(true); }} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"><Pencil size={16} /></button>
                        <button
                          onClick={() => o.idPedido && handleChangeStatus(o.idPedido, o.estado || "")}
                          className={`p-2 rounded-lg border border-slate-200 transition-all ${o.estado === 'BORRADO' ? 'text-green-600 hover:bg-green-50 hover:border-green-200' : 'text-red-500 hover:bg-red-50 hover:border-red-200'}`}
                          title={o.estado === 'BORRADO' ? 'Restaurar' : 'Eliminar'}
                        >
                          {o.estado === 'BORRADO' ? <RefreshCcw size={16} /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800">{editingOrder ? "Editar Pedido" : "Nuevo Pedido"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* 1. Datos Generales (GRID MODIFICADO 2x2) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fila 1: ID y Teléfono */}
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">ID Cliente</label><input type="number" name="idUsuario" defaultValue={editingOrder?.idUsuario} required className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none" /></div>

                {/* NUEVO CAMPO: TELÉFONO (READONLY) */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Teléfono Contacto</label>
                  <div className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-xl p-2.5 text-sm flex items-center gap-2 cursor-not-allowed">
                    <Phone size={14} className="text-slate-400" />
                    <span>{getUserPhone(editingOrder?.idUsuario)}</span>
                  </div>
                </div>

                {/* Fila 2: Fecha y Estado */}
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Fecha</label><input type="date" name="fechaPedido" defaultValue={editingOrder?.fechaPedido} required className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none" /></div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Estado</label>
                  <select name="estado" defaultValue={editingOrder?.estado || "PENDIENTE"} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-slate-900/10 outline-none">
                    <option value="PENDIENTE">PENDIENTE</option><option value="CANCELADO">CANCELADO</option><option value="ACEPTADO">ACEPTADO</option><option value="ENVIADO">ENVIADO</option><option value="ENTREGADO">ENTREGADO</option><option value="BORRADO">BORRADO</option>
                  </select>
                </div>
              </div>

              {/* 2. Personal */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase flex gap-2"><Truck size={14} /> Domiciliario</label>
                  <select name="idDomiciliario" required defaultValue={editingOrder?.idDomiciliario || ""} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white">
                    <option value="">Seleccionar...</option>
                    {drivers.map(d => <option key={d.idDomiciliario} value={d.idDomiciliario}>{d.nombre} {d.apellido}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase flex gap-2"><User size={14} /> Auxiliar</label>
                  <select name="idAuxiliar" required defaultValue={editingOrder?.idAuxiliar || ""} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white">
                    <option value="">Seleccionar...</option>
                    {assistants.map(a => <option key={a.idAuxiliar} value={a.idAuxiliar}>{a.nombre} {a.apellido}</option>)}
                  </select>
                </div>
              </div>

              {/* 3. Costos */}
              <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Costo Pedido</label><input type="number" name="costoPedido" defaultValue={editingOrder?.costoPedido} required className="w-full border border-slate-200 rounded-xl p-2.5 text-sm" /></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Costo Envío</label><input type="number" name="costoEnvio" defaultValue={editingOrder?.costoEnvio} required className="w-full border border-slate-200 rounded-xl p-2.5 text-sm" /></div>
                <div><label className="block text-xs font-bold text-green-600 mb-1.5 uppercase">Total</label><input type="number" name="totalPagar" defaultValue={editingOrder?.totalPagar} required className="w-full border-2 border-green-200 bg-green-50 rounded-xl p-2.5 text-sm font-bold text-green-800" /></div>
              </div>

              {/* 4. Resumen Visual */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase flex items-center gap-2">
                  <Box size={14} className="text-[#4fc3f7]" /> Resumen de Productos
                </label>
                <div className="mb-4">
                  <OrderSummaryViewer productIds={currentProductList} />
                </div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Editar IDs manualmente (Separados por coma)</label>
                <textarea
                  name="listaDeProductos"
                  value={currentProductList.join(", ")}
                  onChange={handleProductListChange}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-500 font-mono h-16 resize-none focus:border-slate-400 outline-none"
                />
              </div>

              {/* 5. Ubicación */}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Sucursal</label><input name="nombreSucursal" defaultValue={editingOrder?.nombreSucursal} required className="w-full border border-slate-200 rounded-xl p-2.5 text-sm" /></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Dirección</label><input name="direccionEntrega" defaultValue={editingOrder?.direccionEntrega} required className="w-full border border-slate-200 rounded-xl p-2.5 text-sm" /></div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminPedidos;