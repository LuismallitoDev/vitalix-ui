import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { toast } from "sonner";

// APIs y Tipos
import { OrderApi, DriverApi, UserApi } from "@/lib/ordersApi";
import { PedidoDTO, DomiciliarioDTO, UsuarioDTO } from "@/lib/types";

// Iconos
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClipboardList,
    faTruck,
    faCheck,
    faPaperPlane,
    faSearch,
    faFilter,
    faMotorcycle,
    faUser,
    faClock,
    faMapMarkerAlt,
    faBoxOpen,
    faCircle,
    faBan // Icono de cancelación
} from "@fortawesome/free-solid-svg-icons";

// --- MODAL DE ASIGNACIÓN (Se mantiene igual, solo se llama cuando NO hay conductor) ---
const AssignDriverModal = ({
    isOpen,
    onClose,
    drivers,
    onConfirm,
    driverLoadMap
}: {
    isOpen: boolean;
    onClose: () => void;
    drivers: DomiciliarioDTO[];
    onConfirm: (driverId: number) => void;
    driverLoadMap: Map<number, boolean>;
}) => {
    const [selectedDriver, setSelectedDriver] = useState<string>("");

    if (!isOpen) return null;

    const availableDrivers = drivers.filter(d => d.estado && d.idDomiciliario);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">Asignar Conductor</h3>
                    <p className="text-xs text-slate-500">Selecciona el repartidor para este pedido.</p>
                </div>

                <div className="p-6">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Conductores Disponibles</label>
                    <select
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-white outline-none focus:border-[#4fc3f7] focus:ring-4 focus:ring-[#4fc3f7]/10 transition-all"
                        value={selectedDriver}
                        onChange={(e) => setSelectedDriver(e.target.value)}
                    >
                        <option value="">-- Seleccionar --</option>
                        {availableDrivers.map(d => {
                            const isBusy = driverLoadMap.get(d.idDomiciliario!) || false;
                            return (
                                <option
                                    key={d.idDomiciliario}
                                    value={d.idDomiciliario}
                                    className={isBusy ? "bg-red-50 text-red-600" : "text-green-600"}
                                >
                                    {d.nombre} {d.apellido} ({d.placaVehiculo}) - {isBusy ? "OCUPADO" : "DISPONIBLE"}
                                </option>
                            );
                        })}
                    </select>

                    <div className="flex gap-2 mt-6">
                        <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                            Cancelar
                        </button>
                        <button
                            disabled={!selectedDriver}
                            onClick={() => onConfirm(Number(selectedDriver))}
                            className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                        >
                            Asignar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
const AssistantDashboard = () => {
    const { user } = useGlobalContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("TODOS");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderToAssign, setOrderToAssign] = useState<PedidoDTO | null>(null);

    // Carga de Datos
    const { data: orders, refetch: refetchOrders, isLoading } = useQuery({
        queryKey: ['orders-assistant'],
        queryFn: OrderApi.getAll,
        refetchInterval: 5000
    });
    const { data: drivers } = useQuery({ queryKey: ['drivers-list'], queryFn: DriverApi.getAll });
    const { data: users } = useQuery({ queryKey: ['users-list'], queryFn: UserApi.getAll });

    // CÁLCULO ESTADO OPERACIONAL
    const driverLoadMap = useMemo(() => {
        if (!orders || !drivers) return new Map<number, boolean>();
        const busyDrivers = new Set<number>();
        orders.forEach(order => {
            if (
                order.idDomiciliario &&
                (order.estado === 'ACEPTADO' || order.estado === 'ENVIADO')
            ) {
                busyDrivers.add(order.idDomiciliario);
            }
        });
        const loadMap = new Map<number, boolean>();
        (drivers || []).forEach(d => {
            if (d.idDomiciliario) {
                loadMap.set(d.idDomiciliario, busyDrivers.has(d.idDomiciliario));
            }
        });
        return loadMap;
    }, [orders, drivers]);

    // Helpers
    const getClientName = (id: number) => {
        const u = users?.find(user => user.idUsuario === id);
        return u ? `${u.nombre} ${u.apellido}` : `Cliente #${id}`;
    };

    const getDriverName = (id?: number) => {
        if (!id || id === 0 || id === 1) return null;
        const d = drivers?.find(driver => driver.idDomiciliario === id);
        return d ? `${d.nombre} ${d.apellido}` : null;
    };

    // --- ACCIONES ---

    // 1. Manejador Universal de Estado (Aceptar / Despachar / Cancelar)
    const handleStatusChange = async (orderId: number, newStatus: string) => {
        // Doble confirmación para CANCELAR
        if (newStatus === 'CANCELADO') {
            if (!window.confirm("¡ADVERTENCIA! ¿Estás seguro de CANCELAR este pedido? No se puede revertir.")) {
                return;
            }
        }

        try {
            await OrderApi.changeStatus(orderId, newStatus);
            toast.success(`Pedido actualizado a: ${newStatus}`);
            refetchOrders();
        } catch (error) {
            toast.error("Error al actualizar estado");
        }
    };

    // 2. Abrir Modal de Asignación
    const openAssignModal = (order: PedidoDTO) => {
        setOrderToAssign(order);
        setIsModalOpen(true);
    };

    // 3. Confirmar Asignación (Update real)
    const handleConfirmAssign = async (driverId: number) => {
        if (!orderToAssign) return;

        try {
            // Se actualiza el DTO con el nuevo conductor
            const updatedOrder = {
                ...orderToAssign,
                idDomiciliario: driverId,
                domiciliario: { idDomiciliario: driverId }
            };

            await OrderApi.update(orderToAssign.idPedido!, updatedOrder);
            toast.success("Conductor asignado correctamente");
            setIsModalOpen(false);
            setOrderToAssign(null);
            refetchOrders();
        } catch (error) {
            toast.error("Error al asignar conductor");
        }
    };

    // Filtrado
    const filteredOrders = useMemo(() => {
        return (orders || [])
            .filter(o => o.estado !== 'BORRADO' && o.estado !== 'ENTREGADO')
            .filter(o => filterStatus === "TODOS" || o.estado === filterStatus)
            .filter(o =>
                (o.idPedido?.toString().includes(searchTerm)) ||
                getClientName(o.idUsuario).toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => (b.idPedido || 0) - (a.idPedido || 0));
    }, [orders, filterStatus, searchTerm, users]);

    // UI Helpers
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDIENTE': return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case 'ACEPTADO': return "bg-blue-100 text-blue-700 border-blue-200";
            case 'ENVIADO': return "bg-purple-100 text-purple-700 border-purple-200";
            case 'CANCELADO': return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-slate-100 text-slate-600";
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-['Montserrat',sans-serif] text-slate-700 pb-20">
            <Navigation />

            <AssignDriverModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                drivers={drivers || []}
                onConfirm={handleConfirmAssign}
                driverLoadMap={driverLoadMap}
            />

            <div className="container mx-auto px-4 pt-24">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-pink-200">Auxiliar</span>
                            <span className="text-slate-400 text-xs font-medium">Panel de Gestión</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">Hola, {user?.displayName.split(" ")[0]}</h1>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                            <input
                                type="text"
                                placeholder="Buscar pedido..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-pink-300 transition-all shadow-sm"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="appearance-none bg-white border border-slate-200 text-slate-600 py-2.5 pl-4 pr-10 rounded-xl text-sm font-medium focus:outline-none shadow-sm cursor-pointer"
                            >
                                <option value="TODOS">Todos</option>
                                <option value="PENDIENTE">Pendientes</option>
                                <option value="ACEPTADO">Aceptados</option>
                                <option value="ENVIADO">Enviados</option>
                                <option value="CANCELADO">Cancelados</option>
                            </select>
                            <FontAwesomeIcon icon={faFilter} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Tabla de Gestión */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Pedido / Valor</th>
                                    <th className="px-6 py-4">Cliente / Dirección</th>
                                    <th className="px-6 py-4">Estado Actual</th>
                                    <th className="px-6 py-4">Asignación</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">Cargando...</td></tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-slate-400">No hay pedidos pendientes de gestión.</td></tr>
                                ) : (
                                    filteredOrders.map(order => {
                                        const driverName = getDriverName(order.idDomiciliario);
                                        const isDriverBusy = order.idDomiciliario ? driverLoadMap.get(order.idDomiciliario) : false;

                                        return (
                                            <tr key={order.idPedido} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                                            #{order.idPedido}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800">${(order.totalPagar || 0).toLocaleString('es-CO')}</div>
                                                            <div className="text-xs text-slate-400 flex items-center gap-1">
                                                                <FontAwesomeIcon icon={faBoxOpen} /> {order.listaDeProductos?.length || 0} items
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-slate-700 flex items-center gap-2">
                                                        <FontAwesomeIcon icon={faUser} className="text-slate-300" />
                                                        {getClientName(order.idUsuario)}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-slate-300" />
                                                        {order.direccionEntrega}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(order.estado)}`}>
                                                        {order.estado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {driverName ? (
                                                        <div className={`flex items-center gap-2 text-slate-700 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 w-fit ${isDriverBusy ? 'border-red-400/50 bg-red-50' : 'border-green-400/50 bg-green-50'}`}>
                                                            <FontAwesomeIcon icon={faMotorcycle} className={isDriverBusy ? 'text-red-600' : 'text-green-600'} />
                                                            <span className="text-xs">{driverName}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic flex items-center gap-1">
                                                            <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                                            Sin Asignar
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">

                                                        {/* Flujo: PENDIENTE -> ACEPTAR / CANCELAR */}
                                                        {order.estado === 'PENDIENTE' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleStatusChange(order.idPedido!, 'ACEPTADO')}
                                                                    className="px-4 py-2 bg-blue-500 text-white font-bold text-xs rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                                                                >
                                                                    <FontAwesomeIcon icon={faCheck} /> Aceptar
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(order.idPedido!, 'CANCELADO')}
                                                                    className="px-4 py-2 bg-red-500 text-white font-bold text-xs rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                                                                >
                                                                    <FontAwesomeIcon icon={faBan} /> Cancelar
                                                                </button>
                                                            </>
                                                        )}

                                                        {/* Flujo: ACEPTADO -> ASIGNAR -> ENVIAR/CANCELAR */}
                                                        {order.estado === 'ACEPTADO' && (
                                                            <>
                                                                {!driverName && (
                                                                    <button
                                                                        onClick={() => openAssignModal(order)}
                                                                        className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-md"
                                                                    >
                                                                        <FontAwesomeIcon icon={faMotorcycle} /> Asignar
                                                                    </button>
                                                                )}

                                                                {driverName && (
                                                                    <button
                                                                        onClick={() => handleStatusChange(order.idPedido!, 'ENVIADO')}
                                                                        className="px-4 py-2 bg-pink-500 text-white font-bold text-xs rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2 shadow-md"
                                                                    >
                                                                        <FontAwesomeIcon icon={faPaperPlane} /> Despachar
                                                                    </button>
                                                                )}
                                                                {/* Cancelar disponible incluso si está asignado antes de despachar */}
                                                                <button
                                                                    onClick={() => handleStatusChange(order.idPedido!, 'CANCELADO')}
                                                                    className="px-4 py-2 bg-red-500 text-white font-bold text-xs rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                                                                >
                                                                    <FontAwesomeIcon icon={faBan} /> Cancelar
                                                                </button>
                                                            </>
                                                        )}

                                                        {/* Flujo: ENVIADO -> CANCELAR (Única acción disponible) */}
                                                        {order.estado === 'ENVIADO' && (
                                                            <button
                                                                onClick={() => handleStatusChange(order.idPedido!, 'CANCELADO')}
                                                                className="px-4 py-2 bg-red-500 text-white font-bold text-xs rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 shadow-md"
                                                            >
                                                                <FontAwesomeIcon icon={faBan} /> Cancelar
                                                            </button>
                                                        )}

                                                        {/* Flujo: CANCELADO (Informativo, sin acciones) */}
                                                        {order.estado === 'CANCELADO' && (
                                                            <span className="text-xs text-slate-400">Acción Finalizada</span>
                                                        )}

                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssistantDashboard;