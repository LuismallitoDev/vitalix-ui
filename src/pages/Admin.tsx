import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import {
  Users,
  ShoppingBag,
  Store,
  Truck,
  Contact,
  LayoutDashboard
} from "lucide-react";
import AdminUsuarios from "@/components/admin/AdminUsuarios";
import AdminPedidos from "@/components/admin/AdminPedidos";
import AdminSucursales from "@/components/admin/AdminSucursales";
import AdminDomiciliarios from "@/components/admin/AdminDomiciliarios";
import AdminAuxiliares from "@/components/admin/AdminAuxiliares";


const Admin = () => {
  const [activeTab, setActiveTab] = useState<"usuarios" | "pedidos" | "sucursales" | "domiciliarios" | "auxiliares">("usuarios");

  const menuItems = [
    { id: "usuarios", label: "Usuarios", icon: Users, color: "text-blue-500" },
    { id: "pedidos", label: "Pedidos", icon: ShoppingBag, color: "text-green-500" },
    { id: "sucursales", label: "Sucursales", icon: Store, color: "text-purple-500" },
    { id: "domiciliarios", label: "Domiciliarios", icon: Truck, color: "text-orange-500" },
    { id: "auxiliares", label: "Auxiliares", icon: Contact, color: "text-pink-500" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-['Montserrat',sans-serif]">
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-10">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* --- 1. SIDEBAR DE NAVEGACIÓN (Los 5 Botones) --- */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sticky top-24">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 px-3">
                <LayoutDashboard size={14} /> Panel Admin
              </h2>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                          ? "bg-slate-800 text-white shadow-md transform scale-[1.02]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                      <Icon size={18} className={isActive ? "text-white" : item.color} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* --- 2. ÁREA DE CONTENIDO (CRUDs) --- */}
          <main className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
            {activeTab === "usuarios" && <AdminUsuarios />}
            {activeTab === "pedidos" && <AdminPedidos />}
            {activeTab === "sucursales" && <AdminSucursales />}
            {activeTab === "domiciliarios" && <AdminDomiciliarios />}
            {activeTab === "auxiliares" && <AdminAuxiliares/>}
            
          </main>
        </div>
      </div>
    </div>
  );
};

export default Admin;