import React, { useState } from "react";
import { getOrders, Order } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation"; 
import Footer from "@/pages/Footer"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBoxOpen,
    faChevronLeft,
    faStore,
    faReceipt,
    faChevronDown,
    faChevronUp,
    faClock,
    faCheckCircle,
    faTimesCircle
} from "@fortawesome/free-solid-svg-icons";

const UserOrders = () => {
    const { user } = useGlobalContext();

    // State to control which order is expanded
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

    const { data: allOrders, isLoading } = useQuery<Order[]>({
        queryKey: ['my-orders'],
        queryFn: getOrders,
        enabled: !!user,
        refetchInterval: 3000
    });

    const myOrders = allOrders?.filter(o => o.cliente_email === user?.email).reverse() || [];

    const toggleDetails = (orderId: number) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null); // Collapse if already open
        } else {
            setExpandedOrderId(orderId); // Expand new
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Aceptado': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rechazado': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Aceptado': return faCheckCircle;
            case 'Rechazado': return faTimesCircle;
            default: return faClock;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f8f9fa] font-['Montserrat',sans-serif] text-slate-700">

            {/* 1. NAVIGATION BAR */}
            <Navigation />

            {/* 2. MAIN CONTENT (Flex-1 to push footer down) */}
            {/* pt-24 ensures content isn't hidden behind fixed navbar */}
            <main className="flex-1 container mx-auto px-4 py-8 pt-24">
                <div className="max-w-3xl mx-auto">

                    {/* HEADER & ACTIONS */}
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

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/profile"
                                className="flex-1 md:flex-none justify-center px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center gap-2 shadow-sm"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} /> Perfil
                            </Link>
                            <Link
                                to="/"
                                className="flex-1 md:flex-none justify-center px-4 py-2.5 text-sm font-bold text-white bg-[#4fc3f7] hover:bg-[#29b6f6] rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faStore} /> Tienda
                            </Link>
                        </div>
                    </div>

                    {/* ORDERS LIST */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin inline-block w-10 h-10 border-4 border-current border-t-transparent text-[#4fc3f7] rounded-full" role="status"></div>
                            <p className="mt-4 text-slate-400 text-sm font-medium">Cargando tu historial...</p>
                        </div>
                    ) : myOrders.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                                <FontAwesomeIcon icon={faBoxOpen} size="3x" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">Aún no has realizado pedidos</h3>
                            <p className="text-slate-500 mb-8 text-sm max-w-xs mx-auto">Explora nuestra tienda y encuentra los mejores productos para tu salud.</p>
                            <Link to="/" className="inline-block px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                Empezar a Comprar
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myOrders.map(order => (
                                <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-slate-300">

                                    {/* Order Header (Clickable) */}
                                    <div
                                        onClick={() => toggleDetails(order.id)}
                                        className="p-5 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white hover:bg-slate-50/50 transition-colors"
                                    >
                                        {/* Left Side: Status & ID */}
                                        <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
                                            <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center border ${getStatusColor(order.estado)} bg-opacity-10`}>
                                                <FontAwesomeIcon icon={getStatusIcon(order.estado)} size="lg" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-slate-800 text-lg">Pedido #{order.id}</p>
                                                    {order.estado === 'Pendiente' && (
                                                        <span className="relative flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                                    <FontAwesomeIcon icon={faClock} className="text-xs" />
                                                    {order.fecha}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right Side: Total & Toggle */}
                                        <div className="flex items-center justify-between w-full sm:w-auto gap-6 pl-16 sm:pl-0">
                                            <div className="text-right">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total</p>
                                                <p className="font-extrabold text-slate-800 text-xl">${order.total.toLocaleString('es-CO')}</p>
                                            </div>
                                            <div className={`text-slate-300 transition-transform duration-300 ${expandedOrderId === order.id ? 'rotate-180' : ''}`}>
                                                <FontAwesomeIcon icon={faChevronDown} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Details (Accordion) */}
                                    {expandedOrderId === order.id && (
                                        <div className="bg-slate-50/80 border-t border-slate-100 p-5 animate-in slide-in-from-top-2 duration-200">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider flex items-center gap-2">
                                                <FontAwesomeIcon icon={faBoxOpen} /> Resumen de Productos
                                            </h4>
                                            <div className="space-y-3">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <span className="bg-blue-50 text-blue-600 font-bold px-2.5 py-1 rounded-lg text-xs border border-blue-100">x{item.quantity}</span>
                                                            <span className="font-semibold text-slate-700 line-clamp-1">{item.name}</span>
                                                        </div>
                                                        <span className="font-bold text-slate-600 whitespace-nowrap pl-2">
                                                            ${(item.price * item.quantity).toLocaleString('es-CO')}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between text-sm gap-2">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <span>Estado del Pago:</span>
                                                    <span className="font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded text-xs">Contra Entrega</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-slate-400 text-xs mr-2">Total Final:</span>
                                                    <span className="font-bold text-slate-800">${order.total.toLocaleString('es-CO')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </main>

            {/* 3. FOOTER */}
            <Footer />
        </div>
    );
}

export default UserOrders;