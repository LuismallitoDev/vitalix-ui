import React, { useState, useEffect } from "react";
import { BranchApi } from "../../lib/ordersApi";
import { SucursalDTO } from "../../lib/types";
import { Plus, Pencil, Trash2, Search, X, Loader2, Building, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

const AdminSucursales = () => {
    const [branches, setBranches] = useState<SucursalDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<SucursalDTO | null>(null);

    // --- HELPERS DE HORA (Formato Militar con Milisegundos) ---
    const formatToBackendTime = (time: string | null) => {
        if (!time) return "00:00:00.000";
        if (time.length === 5) return `${time}:00.000`; // De 14:30 a 14:30:00.000
        return time;
    };

    const formatToInputTime = (time: string | undefined) => {
        if (!time) return "";
        return time.substring(0, 5); // De 14:30:00.000 a 14:30
    };

    // --- CARGA DE DATOS ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await BranchApi.getAll();
            // Ordenamos por ID
            setBranches(Array.isArray(data) ? data.sort((a, b) => (b.idSucursal || 0) - (a.idSucursal || 0)) : []);
        } catch (error) {
            setBranches([]);
            toast.error("Error al cargar sucursales");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- ELIMINAR (DELETE) ---
    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Estás seguro de eliminar esta sucursal permanentemente?")) return;

        try {
            await BranchApi.changeStatus(id);
            toast.success("Sucursal eliminada");
            fetchData();
        } catch (error) {
            toast.error("Error al eliminar. Puede que tenga pedidos asociados.");
        }
    };

    // --- GUARDAR (CREAR / EDITAR) ---
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const nombre = formData.get("nombre") as string;
        const direccion = formData.get("direccion") as string;
        const ciudad = formData.get("ciudad") as string;
        const rawApertura = formData.get("horarioApertura") as string;
        const rawCierre = formData.get("horarioCierre") as string;

        if (!nombre || !direccion || !ciudad) {
            toast.error("Por favor completa todos los campos obligatorios");
            return;
        }

        // Payload "Blindado": Enviamos nombres simples y compuestos por seguridad
        const payload = {
            idSucursal: editingBranch?.idSucursal,

            nombre: nombre,
            nombreSucursal: nombre, // Doble mapeo

            direccion: direccion,
            direccionSucursal: direccion, // Doble mapeo

            ciudad: ciudad,

            horarioApertura: formatToBackendTime(rawApertura),
            horarioCierre: formatToBackendTime(rawCierre)
        };

        try {
            if (editingBranch && editingBranch.idSucursal) {
                await BranchApi.update(editingBranch.idSucursal, payload as any);
                toast.success("Sucursal actualizada");
            } else {
                await BranchApi.create(payload as any);
                toast.success("Sucursal creada exitosamente");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar la sucursal.");
        }
    };

    // --- FILTRO ---
    const filteredBranches = branches.filter((b) =>
        (b.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.ciudad || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Sucursales</h2>
                    <p className="text-slate-500 text-sm">Gestiona la ubicación y horarios de tus sedes</p>
                </div>
                <div>
                    <button
                        onClick={() => { setEditingBranch(null); setIsModalOpen(true); }}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-slate-900/20 transition-all"
                    >
                        <Plus size={18} /> Nueva Sucursal
                    </button>
                </div>
            </div>

            {/* Buscador */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre o ciudad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all shadow-sm"
                />
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Sede / Ciudad</th>
                                <th className="px-6 py-4">Dirección</th>
                                <th className="px-6 py-4">Horarios</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (<tr><td colSpan={4} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" /></td></tr>) :
                                filteredBranches.length === 0 ? (<tr><td colSpan={4} className="p-8 text-center text-slate-400">No hay sucursales registradas</td></tr>) : (
                                    filteredBranches.map((branch) => (
                                        <tr key={branch.idSucursal} className="group hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                                        <Building size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900">{branch.nombre}</div>
                                                        <div className="text-xs text-slate-400">ID: {branch.idSucursal} • {branch.ciudad}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <MapPin size={14} className="text-slate-400" /> {branch.direccion}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col text-xs text-slate-500 gap-1">
                                                    <span className="flex items-center gap-1"><Clock size={10} /> {formatToInputTime(branch.horarioApertura)} - {formatToInputTime(branch.horarioCierre)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => { setEditingBranch(branch); setIsModalOpen(true); }}
                                                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
                                                        title="Editar"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => branch.idSucursal && handleDelete(branch.idSucursal)}
                                                        className="p-2 rounded-lg border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">

                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-lg text-slate-800">{editingBranch ? "Editar Sucursal" : "Nueva Sucursal"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Nombre */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Nombre Sede</label>
                                <input
                                    name="nombre"
                                    defaultValue={editingBranch?.nombre}
                                    required
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all"
                                    placeholder="Ej: Vitalix Plus - Centro"
                                />
                            </div>

                            {/* Ubicación */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Ciudad</label>
                                    <input
                                        name="ciudad"
                                        defaultValue={editingBranch?.ciudad}
                                        required
                                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none"
                                        placeholder="Ej: Medellín"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Dirección</label>
                                    <input
                                        name="direccion"
                                        defaultValue={editingBranch?.direccion}
                                        required
                                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none"
                                        placeholder="Ej: Calle 10 #20-30"
                                    />
                                </div>
                            </div>

                            {/* Horarios */}
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase flex gap-2"><Clock size={14} /> Apertura</label>
                                    <input
                                        type="time"
                                        name="horarioApertura"
                                        defaultValue={formatToInputTime(editingBranch?.horarioApertura) || "08:00"}
                                        required
                                        className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white outline-none focus:border-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase flex gap-2"><Clock size={14} /> Cierre</label>
                                    <input
                                        type="time"
                                        name="horarioCierre"
                                        defaultValue={formatToInputTime(editingBranch?.horarioCierre) || "18:00"}
                                        required
                                        className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white outline-none focus:border-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all"
                                >
                                    {editingBranch ? "Guardar Cambios" : "Crear Sucursal"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSucursales;