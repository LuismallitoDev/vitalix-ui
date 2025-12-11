import React, { useState, useEffect } from "react";
import { AssistantApi, BranchApi } from "../../lib/ordersApi";
import { AuxiliarDTO, SucursalDTO } from "../../lib/types";
import { Plus, Pencil, Trash2, Search, X, Loader2, User, Phone, Building, Users } from "lucide-react";
import { toast } from "sonner";

const AdminAuxiliares = () => {
    const [assistants, setAssistants] = useState<AuxiliarDTO[]>([]);
    const [branches, setBranches] = useState<SucursalDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAssistant, setEditingAssistant] = useState<AuxiliarDTO | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [assistantsData, branchesData] = await Promise.all([
                AssistantApi.getAll(),
                BranchApi.getAll()
            ]);
            setAssistants(Array.isArray(assistantsData) ? assistantsData.sort((a, b) => (b.idAuxiliar || 0) - (a.idAuxiliar || 0)) : []);
            setBranches(Array.isArray(branchesData) ? branchesData : []);
        } catch (error) {
            setAssistants([]);
            toast.error("Error al cargar auxiliares");
        } finally {
            setLoading(false);
        }
    };



    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Estás seguro de eliminar este auxiliar?")) return;
        try {
            await AssistantApi.changeStatus(id);
            toast.success("Auxiliar eliminado/desactivado");
            fetchData();
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const nombre = formData.get("nombre") as string;
        const apellido = formData.get("apellido") as string;
        const idSucursal = Number(formData.get("idSucursal"));

        if (!nombre || !apellido || !idSucursal) { toast.error("Completa los campos obligatorios"); return; }

        const payload = {
            idAuxiliar: editingAssistant?.idAuxiliar,
            nombre: nombre,
            apellido: apellido,
            telefono: formData.get("telefono"),
            idSucursal: idSucursal,
            // Sin placa, sin estado
        };

        try {
            if (editingAssistant?.idAuxiliar) {
                await AssistantApi.update(editingAssistant.idAuxiliar, payload as any);
                toast.success("Auxiliar actualizado");
            } else {
                await AssistantApi.create(payload as any);
                toast.success("Auxiliar creado");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Error al guardar");
        }
    };

    const getBranchName = (id: number) => {
        const b = branches.find(branch => branch.idSucursal === id);
        return b ? b.nombre : "Sin Asignar";
    };

    const filtered = assistants.filter(a =>
        (a.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.apellido || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    useEffect(() => { fetchData(); }, []);
    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Auxiliares</h2>
                    <p className="text-slate-500 text-sm">Gestiona el personal de apoyo en sedes</p>
                </div>
                <button onClick={() => { setEditingAssistant(null); setIsModalOpen(true); }} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg transition-all">
                    <Plus size={18} /> Nuevo Auxiliar
                </button>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" placeholder="Buscar por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 shadow-sm" />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Auxiliar</th>
                                <th className="px-6 py-4">Teléfono</th>
                                <th className="px-6 py-4">Sede Asignada</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (<tr><td colSpan={4} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" /></td></tr>) :
                                filtered.length === 0 ? (<tr><td colSpan={4} className="p-8 text-center text-slate-400">No hay registros</td></tr>) : (
                                    filtered.map((aux) => (
                                        <tr key={aux.idAuxiliar} className="group hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                                                        <Users size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900">{aux.nombre} {aux.apellido}</div>
                                                        <div className="text-xs text-slate-400">ID: {aux.idAuxiliar}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-600"><Phone size={14} className="text-slate-400" /> {aux.telefono || "N/A"}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Building size={14} className="text-slate-400" />
                                                    {getBranchName(aux.idSucursal)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => { setEditingAssistant(aux); setIsModalOpen(true); }} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"><Pencil size={16} /></button>
                                                    <button onClick={() => aux.idAuxiliar && handleDelete(aux.idAuxiliar)} className="p-2 rounded-lg border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-lg text-slate-800">{editingAssistant ? "Editar Auxiliar" : "Nuevo Auxiliar"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Nombre y Apellido */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Nombre</label>
                                    <input name="nombre" defaultValue={editingAssistant?.nombre} required className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-slate-400 outline-none" placeholder="Ej: Ana" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Apellido</label>
                                    <input name="apellido" defaultValue={editingAssistant?.apellido} required className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-slate-400 outline-none" placeholder="Ej: Gómez" />
                                </div>
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Teléfono</label>
                                <input name="telefono" defaultValue={editingAssistant?.telefono} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-slate-400 outline-none" />
                            </div>

                            {/* Sucursal */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase flex gap-2"><Building size={14} /> Sede Asignada</label>
                                <select
                                    name="idSucursal"
                                    required
                                    defaultValue={editingAssistant?.idSucursal || ""}
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-white outline-none focus:border-slate-400"
                                >
                                    <option value="">-- Seleccionar Sede --</option>
                                    {branches.map(b => (
                                        <option key={b.idSucursal} value={1}>
                                            {b.nombre} ({b.ciudad})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 shadow-lg transition-all">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAuxiliares;