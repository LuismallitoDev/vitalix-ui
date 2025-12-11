import React, { useState, useEffect } from "react";
// Importamos BranchApi para llenar el dropdown de sucursales
import { DriverApi, BranchApi } from "../../lib/ordersApi";
import { DomiciliarioDTO, SucursalDTO } from "../../lib/types";
import { Plus, Pencil, Trash2, Search, X, Loader2, Truck, Phone, Building, MapPin } from "lucide-react";
import { toast } from "sonner";

const AdminDomiciliarios = () => {
    const [drivers, setDrivers] = useState<DomiciliarioDTO[]>([]);
    const [branches, setBranches] = useState<SucursalDTO[]>([]); // Lista para el dropdown
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState<DomiciliarioDTO | null>(null);

    // --- CARGA DE DATOS (Drivers + Sucursales) ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [driversData, branchesData] = await Promise.all([
                DriverApi.getAll(),
                BranchApi.getAll()
            ]);

            setDrivers(Array.isArray(driversData) ? driversData.sort((a, b) => (b.idDomiciliario || 0) - (a.idDomiciliario || 0)) : []);
            setBranches(Array.isArray(branchesData) ? branchesData : []);

        } catch (error) {
            setDrivers([]);
            toast.error("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- ELIMINAR (Soft Delete o Físico según tu backend) ---
    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Estás seguro de eliminar este domiciliario?")) return;
        try {
            // Usamos changeStatus como borrado lógico si tu backend lo soporta así, o delete si es físico
            // Ajusta esto según si tu backend usa /delete o cambio de estado
            await DriverApi.changeStatus(id);
            toast.success("Domiciliario eliminado/desactivado");
            fetchData();
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    // --- GUARDAR ---
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const nombre = formData.get("nombre") as string;
        const apellido = formData.get("apellido") as string;
        const telefono = formData.get("telefono") as string;
        const placa = formData.get("placaVehiculo") as string;

        // Convertimos a número el valor del select
        const idSucursal = Number(formData.get("idSucursal"));

        if (!nombre || !apellido || !idSucursal || idSucursal === 0) {
            toast.error("Nombre, Apellido y Sucursal son obligatorios");
            return;
        }

        // --- PAYLOAD BLINDADO ---
        // Enviamos el ID plano Y el objeto anidado para que JPA detecte la relación
        const payload = {
            idDomiciliario: editingDriver?.idDomiciliario,
            nombre: nombre,
            apellido: apellido,
            telefono: telefono,
            placaVehiculo: placa,

            // 1. ID Plano (para DTOs simples)
            idSucursal: idSucursal,
            

            // 2. Objeto Anidado (OBLIGATORIO para JPA @ManyToOne)
            sucursal: {
                idSucursal: idSucursal,
                id: idSucursal // Por si la entidad se llama 'id' genérico
            },

            // Estado (si es necesario enviar en el update)
        };

        console.log("📦 Enviando Domiciliario con Sucursal:", payload);

        try {
            if (editingDriver?.idDomiciliario) {
                await DriverApi.update(editingDriver.idDomiciliario, payload as any);
                toast.success("Domiciliario actualizado");
            } else {
                await DriverApi.create(payload as any);
                toast.success("Domiciliario creado");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar. Revisa la consola.");
        }
    };

    // Helper para obtener nombre de sucursal por ID
    const getBranchName = (id: number) => {
        const b = branches.find(branch => branch.idSucursal === id);
        return b ? b.nombre : "Sin Asignar";
    };

    const filtered = drivers.filter(d =>
        (d.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.apellido || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Domiciliarios</h2>
                    <p className="text-slate-500 text-sm">Gestiona la flota y asignación de sedes</p>
                </div>
                <button onClick={() => { setEditingDriver(null); setIsModalOpen(true); }} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg transition-all">
                    <Plus size={18} /> Nuevo Conductor
                </button>
            </div>

            {/* Buscador */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" placeholder="Buscar por nombre o apellido..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 shadow-sm" />
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Conductor</th>
                                <th className="px-6 py-4">Vehículo</th>
                                <th className="px-6 py-4">Sede Asignada</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (<tr><td colSpan={4} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" /></td></tr>) :
                                filtered.length === 0 ? (<tr><td colSpan={4} className="p-8 text-center text-slate-400">No hay registros</td></tr>) : (
                                    filtered.map((driver) => (
                                        <tr key={driver.idDomiciliario} className="group hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                                        <Truck size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900">{driver.nombre} {driver.apellido}</div>
                                                        <div className="text-xs text-slate-500 flex items-center gap-1"><Phone size={10} /> {driver.telefono}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-mono text-xs border border-slate-200">
                                                    {driver.placaVehiculo || "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Building size={14} className="text-slate-400" />
                                                    {/* Aquí buscamos el nombre de la sucursal usando el ID guardado en driver */}
                                                    {getBranchName(driver.idSucursal)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => { setEditingDriver(driver); setIsModalOpen(true); }} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"><Pencil size={16} /></button>
                                                    <button onClick={() => driver.idDomiciliario && handleDelete(driver.idDomiciliario)} className="p-2 rounded-lg border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"><Trash2 size={16} /></button>
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
                            <h3 className="font-bold text-lg text-slate-800">{editingDriver ? "Editar Conductor" : "Nuevo Conductor"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Nombre y Apellido */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Nombre</label>
                                    <input name="nombre" defaultValue={editingDriver?.nombre} required className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-slate-400 outline-none" placeholder="Ej: Carlos" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Apellido</label>
                                    <input name="apellido" defaultValue={editingDriver?.apellido} required className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-slate-400 outline-none" placeholder="Ej: Ruiz" />
                                </div>
                            </div>

                            {/* Teléfono y Placa */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Teléfono</label>
                                    <input name="telefono" defaultValue={editingDriver?.telefono} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-slate-400 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Placa Vehículo</label>
                                    <input name="placaVehiculo" defaultValue={editingDriver?.placaVehiculo} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-slate-400 outline-none bg-yellow-50" placeholder="AAA-123" />
                                </div>
                            </div>

                            {/* Sucursal Dropdown */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase flex gap-2"><Building size={14} /> Sede Asignada</label>
                                <select
                                    name="idSucursal"
                                    required
                                    defaultValue={editingDriver?.idSucursal || ""}
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-white outline-none focus:border-slate-400"
                                >
                                    <option value="">-- Seleccionar Sede --</option>
                                    {branches.map(b => (
                                        <option key={b.idSucursal} value={b.idSucursal}>
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

export default AdminDomiciliarios;