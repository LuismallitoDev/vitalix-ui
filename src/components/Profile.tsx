import React, { useState, useEffect } from "react";
import { useGlobalContext } from "../hooks/useGlobalContext";
import Navigation from "@/components/Navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faEnvelope,
    faPhone,
    faLocationDot,
    faCalendarDays,
    faShieldHalved,
    faPenToSquare,
    faFloppyDisk,
    faXmark,
    faShoppingCart,
    faList,
    faClipboardList
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Profile = () => {
    const { user, updateUserProfile } = useGlobalContext();
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        displayName: "",
        phone: "",
        address: "",
        password: ""
    });

    // Initialize form data when user loads
    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || "",
                phone: user.phone || "",
                address: user.address || "",
                password: user.password || ""
            });
        }
    }, [user]);

    if (!user) return null;

    const handleSave = () => {
        if (!formData.displayName.trim()) {
            // Simple validation
            alert("El nombre es obligatorio");
            return;
        }

        updateUserProfile({
            ...user,
            ...formData
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        // Revert changes
        setFormData({
            displayName: user.displayName || "",
            phone: user.phone || "",
            address: user.address || "",
            password: user.password || ""
        });
        setIsEditing(false);
    };

    // Format Date
    const formattedDate = user.registerDate
        ? new Date(user.registerDate).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
        : "Desconocido";

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-['Montserrat',sans-serif] text-slate-700">
            <Navigation />

            <div className="container mx-auto px-4 py-12 pt-24">
                <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* HEADER BACKGROUND */}
                    <div className="h-32 bg-gradient-to-r from-[#4fc3f7] to-[#66bb6a]"></div>

                    {/* PROFILE CONTENT */}
                    <div className="px-8 pb-8 relative">

                        {/* AVATAR */}
                        <div className="absolute -top-16 left-8 w-32 h-32 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center">
                            <FontAwesomeIcon icon={faUser} className="text-6xl text-slate-300" />
                        </div>

                        {/* HEADER ACTIONS */}
                        <div className="flex gap-3 justify-end pt-4 mb-6">
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCancel}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors font-medium text-sm"
                                    >
                                        <FontAwesomeIcon icon={faXmark} /> Cancelar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4fc3f7] hover:bg-[#29b6f6] text-white shadow-md transition-colors font-medium text-sm"
                                    >
                                        <FontAwesomeIcon icon={faFloppyDisk} /> Guardar Cambios
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4fc3f7] text-white hover:bg-[#42bff9] border-slate-200 transition-colors font-medium text-sm"
                                    >
                                        <FontAwesomeIcon icon={faClipboardList} /> <Link to={"/orders"}>Mis Pedidos</Link>
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors font-medium text-sm"
                                    >
                                        <FontAwesomeIcon icon={faPenToSquare} /> Editar Perfil
                                    </button>
                                </>
                            )}
                        </div>

                        {/* TITLE SECTION */}
                        <div className="mt-4 mb-8">
                            <h1 className="text-3xl font-bold text-slate-800">{user.displayName}</h1>
                            <div className="flex items-center gap-2 text-sm mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${user.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {user.status || 'Active'}
                                </span>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-500">{user.email}</span>
                            </div>
                        </div>

                        {/* FORM GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* COLUMN 1 */}
                            <div className="space-y-6">
                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Nombre Completo</label>
                                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 group-focus-within:border-[#4fc3f7] group-focus-within:ring-1 group-focus-within:ring-[#4fc3f7] transition-all">
                                        <FontAwesomeIcon icon={faUser} className="text-slate-400" />
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.displayName}
                                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                                className="bg-transparent w-full outline-none text-slate-700 font-medium"
                                            />
                                        ) : (
                                            <span className="text-slate-700 font-medium">{user.displayName}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Teléfono</label>
                                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 group-focus-within:border-[#4fc3f7] group-focus-within:ring-1 group-focus-within:ring-[#4fc3f7] transition-all">
                                        <FontAwesomeIcon icon={faPhone} className="text-slate-400" />
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                placeholder="Sin registrar"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="bg-transparent w-full outline-none text-slate-700 font-medium placeholder:text-slate-300"
                                            />
                                        ) : (
                                            <span className={`font-medium ${user.phone ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                                                {user.phone || "Sin registrar"}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Contraseña</label>
                                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 group-focus-within:border-[#4fc3f7] group-focus-within:ring-1 group-focus-within:ring-[#4fc3f7] transition-all">
                                        <FontAwesomeIcon icon={faShieldHalved} className="text-slate-400" />
                                        {isEditing ? (
                                            <input
                                                type="text" // Visible for editing in this demo
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="bg-transparent w-full outline-none text-slate-700 font-medium"
                                            />
                                        ) : (
                                            <span className="text-slate-700 font-medium">••••••••</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* COLUMN 2 */}
                            <div className="space-y-6">
                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Correo Electrónico</label>
                                    <div title="El correo no se puede modificar" className="flex items-center gap-3 bg-slate-100 px-4 py-3 rounded-xl border border-slate-200 opacity-70 cursor-not-allowed">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-slate-400" />
                                        <span className="text-slate-500 font-medium">{user.email}</span>
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Dirección Predeterminada</label>
                                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 group-focus-within:border-[#4fc3f7] group-focus-within:ring-1 group-focus-within:ring-[#4fc3f7] transition-all">
                                        <FontAwesomeIcon icon={faLocationDot} className="text-slate-400" />
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                placeholder="Ej: Calle 123 # 45-67, Medellín"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className="bg-transparent w-full outline-none text-slate-700 font-medium placeholder:text-slate-300"
                                            />
                                        ) : (
                                            <span className={`font-medium ${user.address ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                                                {user.address || "Sin registrar"}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Fecha de Registro</label>
                                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                                        <FontAwesomeIcon icon={faCalendarDays} className="text-slate-400" />
                                        <span className="text-slate-700 font-medium">{formattedDate}</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;