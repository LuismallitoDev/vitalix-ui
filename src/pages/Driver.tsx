import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { toast } from "sonner";

// APIs y Tipos
import { OrderApi, DriverApi, UserApi } from "@/lib/ordersApi";
import { getProducts } from "@/lib/api";
import { getImages } from "@/lib/imageApi"; // Importamos API de imágenes
import { PedidoDTO, DomiciliarioDTO, UsuarioDTO } from "@/lib/types";

// Iconos
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMotorcycle,
    faBoxOpen,
    faMapMarkerAlt,
    faPhone,
    faCheckCircle,
    faChevronDown,
    faMoneyBillWave,
    faMapLocationDot
} from "@fortawesome/free-solid-svg-icons";
import AddressMap from "@/components/ui/AddressMap";

// --- SUB-COMPONENTE: FILA DE PRODUCTO (PARA CONDUCTOR) ---
const DriverProductRow = ({ id, quantity, allProducts }: { id: number, quantity: number, allProducts: any[] }) => {
    // Buscar info del producto
    const productInfo = allProducts.find(p => p.código === id);

    // Fetch de imagen
    const { data: images } = useQuery({
        queryKey: ['product-image', id],
        queryFn: () => getImages(id),
        staleTime: 1000 * 60 * 10,
    });

    const imageUrl = images && images.length > 0 ? images[0].url : "https://via.placeholder.com/60?text=No+Img";

    return (
        <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
            {/* Imagen Grande para ver fácil en móvil */}
            <div className="w-14 h-14 bg-slate-50 rounded-md shrink-0 flex items-center justify-center border border-slate-100 overflow-hidden p-1">
                <img src={imageUrl} alt="prod" className="max-w-full max-h-full object-contain mix-blend-multiply" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-700 leading-tight line-clamp-2">
                    {productInfo ? productInfo.descripción : `Producto ${id}`}
                </p>
                <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">ID: {id}</p>
            </div>

            {/* Cantidad Destacada */}
            <div className="flex flex-col items-center justify-center bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                <span className="text-lg font-extrabold text-blue-600 leading-none">x{quantity}</span>
                <span className="text-[9px] text-blue-400 font-bold uppercase">Cant</span>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTE: LISTA DE PRODUCTOS ---
const DriverOrderItemsList = ({ productIds }: { productIds: number[] }) => {
    // 1. Obtener catálogo
    const { data: products } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
        staleTime: 1000 * 60 * 5
    });

    // 2. Agrupar IDs
    const groupedItems = useMemo(() => {
        if (!productIds) return [];
        const counts: Record<number, number> = {};
        productIds.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
        return Object.entries(counts).map(([id, qty]) => ({ id: Number(id), qty: qty }));
    }, [productIds]);

    if (!products) return <div className="p-3 text-center text-xs text-slate-400 italic">Cargando detalles...</div>;
    if (productIds.length === 0) return <div className="p-3 text-center text-xs text-slate-400 italic">Sin productos.</div>;

    return (
        <div className="space-y-2">
            {groupedItems.map(item => (
                <DriverProductRow key={item.id} id={item.id} quantity={item.qty} allProducts={products} />
            ))}
        </div>
    );
};

// --- SUB-COMPONENTE: TARJETA DE PEDIDO ---
const DriverOrderCard = ({ order, client, onStatusChange }: { order: PedidoDTO, client?: UsuarioDTO, onStatusChange: (id: number) => void }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const openWaze = () => {
        const query = encodeURIComponent(order.direccionEntrega);
        // Intenta abrir con protocolo geo primero, fallback a google maps web
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    };

    const callClient = () => {
        if (client?.telefono) window.open(`tel:${client.telefono}`);
        else toast.error("El cliente no tiene teléfono registrado");
    };

    return (
        <div className={`bg-white rounded-2xl border shadow-sm transition-all overflow-hidden ${order.estado === 'ENTREGADO' ? 'border-green-200 opacity-75' : 'border-slate-200 shadow-md'}`}>

            {/* Header Tarjeta */}
            <div className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                                #{order.idPedido}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${order.estado === 'ENTREGADO' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                {order.estado}
                            </span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">{client ? `${client.nombre} ${client.apellido}` : "Cliente Desconocido"}</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 font-bold uppercase">Cobrar</p>
                        <p className="text-xl font-extrabold text-slate-900">${(order.totalPagar || 0).toLocaleString('es-CO')}</p>
                    </div>
                </div>

                {/* Dirección y Botones */}
                <div className="flex items-center justify-between gap-3 mt-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600 flex-1 truncate bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-red-400" />
                        <AddressMap address={order.direccionEntrega}/>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button onClick={openWaze} className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors border border-blue-100" title="Mapa">
                            <FontAwesomeIcon icon={faMapLocationDot} />
                        </button>
                        <button onClick={callClient} className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors border border-green-100" title="Llamar">
                            <FontAwesomeIcon icon={faPhone} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Acción Principal */}
            {order.estado !== 'ENTREGADO' && (
                <div className="px-5 pb-5">
                    <button
                        onClick={() => onStatusChange(order.idPedido!)}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-slate-800"
                    >
                        <FontAwesomeIcon icon={faCheckCircle} />
                        Confirmar Entrega
                    </button>
                </div>
            )}

            {/* Detalles Desplegables (PRODUCTOS) */}
            <div className="border-t border-slate-100">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full py-3 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
                >
                    {isExpanded ? "Ocultar Productos" : `Ver Productos (${order.listaDeProductos.length})`}
                    <FontAwesomeIcon icon={faChevronDown} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                    <div className="p-5 bg-slate-50/50 animate-in slide-in-from-top-2">

                        {/* LISTA VISUAL DE PRODUCTOS */}
                        <div className="mb-4">
                            <DriverOrderItemsList productIds={order.listaDeProductos} />
                        </div>

                        {/* Footer Info */}
                        <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-200/50">
                            <span className="text-slate-500 text-xs">Método de Pago:</span>
                            <span className="font-bold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded text-xs shadow-sm">
                                <FontAwesomeIcon icon={faMoneyBillWave} className="mr-1 text-green-500" /> Contra Entrega
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
const DriverDashboard = () => {
    const { user } = useGlobalContext();
    const [currentDriverId, setCurrentDriverId] = useState<number | null>(null);

    // 1. Cargar datos
    const { data: orders, refetch: refetchOrders } = useQuery({ queryKey: ['orders-driver'], queryFn: OrderApi.getAll, refetchInterval: 10000 });
    const { data: drivers } = useQuery({ queryKey: ['drivers-list'], queryFn: DriverApi.getAll });
    const { data: users } = useQuery({ queryKey: ['users-list'], queryFn: UserApi.getAll });

    // 2. Identificar al Conductor
    useEffect(() => {
        if (user && drivers) {
            const driverFound = drivers.find(d =>
                `${d.nombre} ${d.apellido}`.toLowerCase().trim() === user.displayName.toLowerCase().trim()
            );
            if (driverFound) setCurrentDriverId(driverFound.idDomiciliario!);
        }
    }, [user, drivers]);

    // 3. Filtrar Pedidos
    const myOrders = useMemo(() => {
        if (!orders || !currentDriverId) return [];
        return orders
            .filter(o => o.idDomiciliario === currentDriverId)
            .filter(o => o.estado !== 'BORRADO' && o.estado !== 'CANCELADO')
            .sort((a, b) => {
                if (a.estado === 'ENTREGADO' && b.estado !== 'ENTREGADO') return 1;
                if (a.estado !== 'ENTREGADO' && b.estado === 'ENTREGADO') return -1;
                return (b.idPedido || 0) - (a.idPedido || 0);
            });
    }, [orders, currentDriverId]);

    // 4. Acción: Marcar como Entregado
    const handleMarkDelivered = async (orderId: number) => {
        if (!window.confirm("¿Confirmas que has entregado este pedido y recibido el dinero?")) return;
        try {
            await OrderApi.changeStatus(orderId, "ENTREGADO");
            toast.success("¡Excelente! Pedido entregado.");
            refetchOrders();
        } catch (error) { toast.error("Error al actualizar estado"); }
    };

    const getClientData = (userId: number) => users?.find(u => u.idUsuario === userId);

    if (!currentDriverId) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
                <div>
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <FontAwesomeIcon icon={faMotorcycle} size="2x" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-700">Cuenta no vinculada</h2>
                    <p className="text-slate-500 mt-2 text-sm">Tu usuario <strong>{user?.displayName}</strong> no coincide con ningún conductor registrado.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0f4f8] font-['Montserrat',sans-serif] pb-20">
            <Navigation />

            <div className="container mx-auto px-4 pt-24">

                {/* Header Driver */}
                <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl mb-8 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase mb-1">Panel de Conductor</p>
                        <h1 className="text-2xl font-bold">Hola, {user?.displayName.split(" ")[0]}</h1>
                        <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            En servicio
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                        <FontAwesomeIcon icon={faMotorcycle} className="text-white" />
                    </div>
                </div>

                {/* Resumen Rápido */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 min-w-[140px] flex-1">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pendientes</p>
                        <p className="text-3xl font-extrabold text-blue-600 mt-1">
                            {myOrders.filter(o => o.estado !== 'ENTREGADO').length}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 min-w-[140px] flex-1">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Entregados</p>
                        <p className="text-3xl font-extrabold text-green-600 mt-1">
                            {myOrders.filter(o => o.estado === 'ENTREGADO').length}
                        </p>
                    </div>
                </div>

                {/* Lista de Pedidos */}
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBoxOpen} className="text-slate-400" />
                    Tus Asignaciones
                </h2>

                {myOrders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                        <p className="text-slate-400 text-sm">No tienes pedidos asignados por ahora.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myOrders.map(order => (
                            <DriverOrderCard
                                key={order.idPedido}
                                order={order}
                                client={getClientData(order.idUsuario)}
                                onStatusChange={handleMarkDelivered}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriverDashboard;