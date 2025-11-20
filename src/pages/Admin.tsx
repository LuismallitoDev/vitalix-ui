import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { getOrders, updateOrderStatus, Order } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faXmark,
  faSpinner,
  faUserShield,
  faChevronDown,
  faChevronUp,
  faBoxOpen,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faEnvelope,
  faUser
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";

const Admin = () => {
  const queryClient = useQueryClient();
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // Cargar pedidos en tiempo real (Polling cada 3s)
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['admin-orders'],
    queryFn: getOrders,
    refetchInterval: 3000
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success("Estado del pedido actualizado correctamente");
    },
    onError: () => toast.error("Error al actualizar el estado")
  });

  const handleStatusChange = (e: React.MouseEvent, id: number, status: string) => {
    e.stopPropagation(); // Evitar que se expanda/colapse al hacer clic en los botones
    updateStatusMutation.mutate({ id, status });
  };

  const toggleDetails = (orderId: number) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aceptado': return 'bg-green-100 text-green-700 border-green-200';
      case 'Rechazado': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-['Montserrat',sans-serif] text-slate-700">
      <Navigation />

      <div className="container mx-auto px-4 py-12 pt-24">
        <div className="max-w-4xl mx-auto">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg text-white">
                  <FontAwesomeIcon icon={faUserShield} />
                </div>
                Panel de Administración
              </h1>
              <p className="text-sm text-slate-500 mt-1 ml-1">Gestiona y revisa los pedidos entrantes</p>
            </div>

            {/* Stats Summary (Optional) */}
            <div className="hidden md:flex gap-4 text-sm font-bold text-slate-600">
              <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                Pendientes: <span className="text-yellow-600">{orders?.filter(o => o.estado === 'Pendiente').length || 0}</span>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-[#4fc3f7] mb-4" />
              <p className="text-slate-400">Cargando pedidos...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders?.slice().reverse().map((order) => (
                <div key={order.id} className={`bg-white rounded-xl border shadow-sm transition-all overflow-hidden ${order.estado === 'Pendiente' ? 'border-yellow-200 shadow-md ring-1 ring-yellow-100' : 'border-slate-200'}`}>

                  {/* CARD HEADER (Clickable) */}
                  <div
                    onClick={() => toggleDetails(order.id)}
                    className="p-5 cursor-pointer hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    {/* Left: ID & Status */}
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${getStatusColor(order.estado)}`}>
                        <FontAwesomeIcon icon={
                          order.estado === 'Aceptado' ? faCheckCircle :
                            order.estado === 'Rechazado' ? faTimesCircle : faClock
                        } size="lg" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-slate-800">Pedido #{order.id}</h3>
                          {order.estado === 'Pendiente' && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded uppercase border border-yellow-200">Nuevo</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex flex-col sm:flex-row sm:gap-3 mt-1">
                          <span className="flex items-center gap-1"><FontAwesomeIcon icon={faUser} /> {order.cliente_nombre}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center gap-1"><FontAwesomeIcon icon={faClock} /> {order.fecha}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions & Total */}
                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end pl-16 md:pl-0">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Total</p>
                        <p className="font-bold text-slate-800 text-lg">${order.total.toLocaleString('es-CO')}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* ACTION BUTTONS (Only for Pending) */}
                        {order.estado === 'Pendiente' && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => handleStatusChange(e, order.id, 'Rechazado')}
                              className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-lg border border-red-100 transition-colors"
                              title="Rechazar"
                            >
                              <FontAwesomeIcon icon={faXmark} />
                            </button>
                            <button
                              onClick={(e) => handleStatusChange(e, order.id, 'Aceptado')}
                              className="w-8 h-8 flex items-center justify-center bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-lg border border-green-100 transition-colors"
                              title="Aceptar"
                            >
                              <FontAwesomeIcon icon={faCheck} />
                            </button>
                          </div>
                        )}

                        {/* Expand Icon */}
                        <FontAwesomeIcon
                          icon={expandedOrderId === order.id ? faChevronUp : faChevronDown}
                          className="text-slate-300 ml-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* DETAILS (Accordion) */}
                  {expandedOrderId === order.id && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-6 animate-in slide-in-from-top-1">

                      {/* Client Info */}
                      <div className="mb-6 p-4 bg-white rounded-lg border border-slate-200 flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-full text-[#4fc3f7]">
                          <FontAwesomeIcon icon={faEnvelope} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-bold">Contacto del Cliente</p>
                          <p className="text-sm font-medium text-slate-700">{order.cliente_email}</p>
                        </div>
                      </div>

                      {/* Products List */}
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faBoxOpen} /> Productos Solicitados
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm p-3 bg-white rounded border border-slate-200">
                            <div className="flex items-center gap-3">
                              <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded text-xs border border-slate-200">x{item.quantity}</span>
                              <span className="text-slate-700 font-medium">{item.name}</span>
                            </div>
                            <span className="font-bold text-slate-600">
                              ${(item.price * item.quantity).toLocaleString('es-CO')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Expanded Actions (If Pending) */}
                      {order.estado === 'Pendiente' && (
                        <div className="mt-6 pt-6 border-t border-slate-200 flex justify-end gap-4">
                          <button
                            onClick={(e) => handleStatusChange(e, order.id, 'Rechazado')}
                            className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-all shadow-sm"
                          >
                            Rechazar Pedido
                          </button>
                          <button
                            onClick={(e) => handleStatusChange(e, order.id, 'Aceptado')}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg"
                          >
                            Aprobar y Despachar
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              ))}

              {orders?.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                  <p className="text-slate-400">No hay pedidos registrados aún.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;