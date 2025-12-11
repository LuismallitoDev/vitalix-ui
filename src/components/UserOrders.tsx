import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/pages/Footer";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { toast } from "sonner"; // Importamos toast para notificaciones

// Imports de API Real
import { OrderApi } from "@/lib/ordersApi";
import { getProducts } from "@/lib/api";
import { getImages } from "@/lib/imageApi";
import { PedidoDTO } from "@/lib/types";

// Iconos
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBoxOpen,
    faChevronLeft,
    faStore,
    faReceipt,
    faChevronDown,
    faClock,
    faCheckCircle,
    faTimesCircle,
    faTruck,
    faMoneyBillWave,
    faBan,
    faMapMarkerAlt
} from "@fortawesome/free-solid-svg-icons";

// --- SUB-COMPONENTE: FILA DE PRODUCTO CON IMAGEN ---
const OrderProductRow = ({ id, quantity, allProducts }: { id: number, quantity: number, allProducts: any[] }) => {
    const productInfo = allProducts.find(p => p.código === id);

    const { data: images } = useQuery({
        queryKey: ['product-image', id],
        queryFn: () => getImages(id),
        staleTime: 1000 * 60 * 10,
    });

    const imageUrl = images && images.length > 0 ? images[0].url : "https://via.placeholder.com/60?text=No+Img";

    return (
        <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-lg flex-shrink-0 flex items-center justify-center p-1 border border-slate-100 overflow-hidden">
                <img src={imageUrl} alt="Producto" className="max-w-full max-h-full object-contain mix-blend-multiply" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-700 line-clamp-2">
                    {productInfo ? productInfo.descripción : `Producto ID: ${id}`}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                        ID: {id}
                    </span>
                    {productInfo && (
                        <span className="text-xs text-slate-400">
                            ${productInfo.total_precio?.toLocaleString('es-CO')} c/u
                        </span>
                    )}
                </div>
            </div>
            <div className="text-right">
                <span className="block text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg mb-1">
                    x{quantity}
                </span>
                {productInfo && (
                    <span className="text-xs font-bold text-slate-700">
                        ${(productInfo.total_precio * quantity).toLocaleString('es-CO')}
                    </span>
                )}
            </div>
        </div>
    );
};

// --- SUB-COMPONENTE: LISTA DE PRODUCTOS ---
const OrderItemsList = ({ productIds }: { productIds: number[] }) => {
    const { data: products } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
        staleTime: 1000 * 60 * 5
    });

    const groupedItems = useMemo(() => {
        if (!productIds) return [];
        const counts: Record<number, number> = {};
        productIds.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
        return Object.entries(counts).map(([id, qty]) => ({ id: Number(id), qty: qty }));
    }, [productIds]);

    if (!products) return <div className="text-center py-4 text-xs text-slate-400">Cargando detalles de productos...</div>;
    if (!groupedItems.length) return <div className="text-center py-4 text-xs text-slate-400 italic">No hay productos registrados en este pedido.</div>;

    return (
        <div className="space-y-3">
            {groupedItems.map(item => (
                <OrderProductRow key={item.id} id={item.id} quantity={item.qty} allProducts={products} />
            ))}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
const UserOrders = () => {
    const { user } = useGlobalContext();
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

    // Fetch de pedidos (con refetch manual disponible)
    const { data: allOrders, isLoading, refetch } = useQuery<PedidoDTO[]>({
        queryKey: ['my-orders-real'],
        queryFn: OrderApi.getAll,
        enabled: !!user,
        refetchInterval: 5000
    });

    const myOrders = useMemo(() => {
        if (!allOrders || !user) return [];
        return allOrders
            .filter(o => o.idUsuario === Number(user.uid))
            .filter(o => o.estado !== 'BORRADO')
            .sort((a, b) => (b.idPedido || 0) - (a.idPedido || 0));
    }, [allOrders, user]);

    const toggleDetails = (orderId: number) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    // --- LÓGICA DE CANCELACIÓN ---
    const handleCancelOrder = async (orderId: number) => {
        // 1. Doble Check (Confirmación)
        if (!window.confirm("¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            // 2. Llamada a API
            await OrderApi.changeStatus(orderId, "CANCELADO");
            toast.success("Pedido cancelado exitosamente");

            // 3. Recargar datos inmediatamente
            refetch();
        } catch (error) {
            console.error(error);
            toast.error("Error al cancelar el pedido. Intenta nuevamente.");
        }
    };

    const getStatusColor = (status: string = "") => {
        const s = status.toUpperCase();
        switch (s) {
            case 'ENTREGADO': case 'ACEPTADO': return 'bg-green-100 text-green-700 border-green-200';
            case 'RECHAZADO': case 'CANCELADO': return 'bg-red-100 text-red-700 border-red-200';
            case 'ENVIADO': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const getStatusIcon = (status: string = "") => {
        const s = status.toUpperCase();
        switch (s) {
            case 'ENTREGADO': case 'ACEPTADO': return faCheckCircle;
            case 'RECHAZADO': case 'CANCELADO': return faTimesCircle;
            case 'ENVIADO': return faTruck;
            default: return faClock;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f8f9fa] font-['Montserrat',sans-serif] text-slate-700">
            <Navigation />

            <main className="flex-1 container mx-auto px-4 py-8 pt-24">
                <div className="max-w-3xl mx-auto">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-[#4fc3f7]">
                                    <FontAwesomeIcon icon={faReceipt} />
                                </div>
                                Mis Pedidos
                            </h1>
                            <p className="text-sm text-slate-500 mt-1 ml-1">Historial de tus compras recientes</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link to="/profile" className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
                                <FontAwesomeIcon icon={faChevronLeft} /> Perfil
                            </Link>
                            <Link to="/" className="px-4 py-2.5 text-sm font-bold text-white bg-[#4fc3f7] hover:bg-[#29b6f6] rounded-xl shadow-md transition-all flex items-center gap-2">
                                <FontAwesomeIcon icon={faStore} /> Tienda
                            </Link>
                        </div>
                    </div>

                    {/* LISTA */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin w-10 h-10 border-4 border-t-transparent border-[#4fc3f7] rounded-full"></div>
                            <p className="mt-4 text-slate-400 text-sm font-medium">Cargando tu historial...</p>
                        </div>
                    ) : myOrders.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                                <FontAwesomeIcon icon={faBoxOpen} size="3x" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">Aún no tienes pedidos</h3>
                            <p className="text-slate-500 mb-8 text-sm max-w-xs mx-auto">Explora nuestra tienda y encuentra los mejores productos.</p>
                            <Link to="/" className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all shadow-lg">
                                Ir a la Tienda
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myOrders.map(order => (
                                <div key={order.idPedido} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">

                                    {/* CABECERA */}
                                    <div
                                        onClick={() => toggleDetails(order.idPedido!)}
                                        className="p-5 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white hover:bg-slate-50/50 transition-colors"
                                    >
                                        <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
                                            <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center border ${getStatusColor(order.estado)} bg-opacity-10`}>
                                                <FontAwesomeIcon icon={getStatusIcon(order.estado)} size="lg" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-slate-800 text-lg">Pedido #{order.idPedido}</p>
                                                    {order.estado === 'PENDIENTE' && (
                                                        <span className="relative flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                                    <FontAwesomeIcon icon={faClock} className="text-xs" />
                                                    {order.fechaPedido}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between w-full sm:w-auto gap-6 pl-16 sm:pl-0">
                                            <div className="text-right">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total</p>
                                                <p className="font-extrabold text-slate-800 text-xl">${(order.totalPagar || 0).toLocaleString('es-CO')}</p>
                                            </div>
                                            <div className={`text-slate-300 transition-transform duration-300 ${expandedOrderId === order.idPedido ? 'rotate-180' : ''}`}>
                                                <FontAwesomeIcon icon={faChevronDown} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* DETALLES DESPLEGABLES */}
                                    {expandedOrderId === order.idPedido && (
                                        <div className="bg-slate-50/80 border-t border-slate-100 p-5 animate-in slide-in-from-top-2 duration-200">

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                                                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Dirección de Entrega</p>
                                                    <div className="flex items-center gap-2 text-slate-700">
                                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#4fc3f7]" />
                                                        {order.direccionEntrega}
                                                    </div>
                                                </div>
                                                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Sucursal que Atiende</p>
                                                    <div className="flex items-center gap-2 text-slate-700">
                                                        <FontAwesomeIcon icon={faStore} className="text-purple-400" />
                                                        {order.nombreSucursal}
                                                    </div>
                                                </div>
                                            </div>

                                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider flex items-center gap-2">
                                                <FontAwesomeIcon icon={faBoxOpen} /> Productos
                                            </h4>

                                            <div className="mb-6">
                                                <OrderItemsList productIds={order.listaDeProductos} />
                                            </div>

                                            <div className="pt-4 border-t border-slate-200">
                                                <div className="flex flex-col gap-2 max-w-xs ml-auto text-sm">
                                                    <div className="flex justify-between text-slate-500">
                                                        <span>Subtotal Productos:</span>
                                                        <span className="font-medium">${(order.costoPedido || 0).toLocaleString('es-CO')}</span>
                                                    </div>
                                                    <div className="flex justify-between text-slate-500">
                                                        <span>Costo Envío:</span>
                                                        <span className="font-medium">
                                                            {order.costoEnvio === 0 ? <span className="text-green-600 font-bold text-xs bg-green-100 px-2 py-0.5 rounded">GRATIS</span> : `$${(order.costoEnvio || 0).toLocaleString('es-CO')}`}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-lg border-t border-slate-200 pt-2 mt-1">
                                                        <span className="font-bold text-slate-800">Total Pagado:</span>
                                                        <span className="font-extrabold text-slate-900">${(order.totalPagar || 0).toLocaleString('es-CO')}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex justify-end items-center gap-3">
                                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-200 text-slate-600 text-xs font-bold">
                                                        <FontAwesomeIcon icon={faMoneyBillWave} /> Pago Contra Entrega
                                                    </span>
                                                </div>

                                                {/* --- BOTÓN DE CANCELAR (Solo si es PENDIENTE) --- */}
                                                {order.estado === 'PENDIENTE' && (
                                                    <div className="mt-6 pt-4 border-t border-red-100 flex justify-end">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCancelOrder(order.idPedido!);
                                                            }}
                                                            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md"
                                                        >
                                                            <FontAwesomeIcon icon={faBan} />
                                                            Cancelar Pedido
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default UserOrders;