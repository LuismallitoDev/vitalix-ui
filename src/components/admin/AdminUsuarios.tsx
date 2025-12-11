import React, { useState, useEffect } from "react";
import { UserApi } from "@/lib/ordersApi";
import { UsuarioDTO } from "@/lib/types";
import { Plus, Pencil, Trash2, Search, X, Loader2, UserCheck, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

// Estado inicial
const INITIAL_FORM_STATE: UsuarioDTO = {
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  direccion: "",
  password: "",
  fechaRegistro: new Date().toISOString().split('T')[0],
  estado: true // Por defecto Activo al crear
};

const AdminUsuarios = () => {
  const [users, setUsers] = useState<UsuarioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false); // Opción para ver los eliminados si lo necesitas
  
  // Estado Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UsuarioDTO>(INITIAL_FORM_STATE);

  // --- 1. CARGAR ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await UserApi.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Error al cargar usuarios");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- 2. INPUTS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- 3. MODAL ---
  const openModal = (user?: UsuarioDTO) => {
    if (user) {
      setFormData({ ...user, password: user.password || "" });
      setIsEditing(true);
    } else {
      setFormData(INITIAL_FORM_STATE);
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  // --- 4. SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email) {
      toast.warning("Nombre e Email requeridos");
      return;
    }

    // Payload limpio
    const payload = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      telefono: formData.telefono,
      password: formData.password || "123456",
      direccion: formData.direccion,
      fechaRegistro: formData.fechaRegistro,
      // Nota: No enviamos 'estado' ni 'idUsuario' en el body, el backend lo maneja
    };

    try {
      if (isEditing && formData.idUsuario) {
        await UserApi.update(formData.idUsuario, payload as UsuarioDTO);
        toast.success("Usuario actualizado");
      } else {
        await UserApi.create(payload as UsuarioDTO);
        toast.success("Usuario creado");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error("Error al guardar");
    }
  };

  // --- 5. CAMBIAR ESTADO (Borrado Lógico) ---
  const handleChangeStatus = async (id: number) => {
    if (!window.confirm("¿Eliminar este usuario de la lista?")) return;
    try {
      await UserApi.changeStatus(id);
      toast.success("Usuario eliminado correctamente");
      fetchUsers(); // Al recargar, desaparecerá de la lista
    } catch (error) {
      toast.error("Error al cambiar estado");
    }
  };

  // --- 6. FILTRADO INTELIGENTE ---
  const filteredUsers = users.filter(u => {
    // 1. FILTRO DE ESTADO: 
    if (!showInactive) {
      if (u.estado === false || u.estado === "Inactivo" || u.estado === null) {
        return false; // Ocultar
      }
    }

    // 2. FILTRO DE TEXTO
    const nombre = (u.nombre || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const term = searchTerm.toLowerCase();
    return nombre.includes(term) || email.includes(term);
  });

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gestión de Usuarios</h2>
          <p className="text-sm text-slate-500">
            Mostrando {filteredUsers.length} usuarios activos
          </p>
        </div>
        <div className="flex gap-2">
           {/* Botón opcional para ver papelera */}
           <button 
            onClick={() => setShowInactive(!showInactive)}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${showInactive ? 'bg-slate-200 text-slate-700' : 'text-slate-400 hover:bg-slate-50'}`}
            title={showInactive ? "Ocultar eliminados" : "Ver eliminados"}
          >
            {showInactive ? <EyeOff size={16}/> : <Eye size={16}/>}
          </button>

          <button 
            onClick={() => openModal()} 
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={16} /> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {/* TABLA */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
            <tr>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4">Dirección</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-500"/></td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">
                 {searchTerm ? "No se encontraron coincidencias" : "No hay usuarios activos"}
              </td></tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr key={user.idUsuario || `idx-${index}`} className={`transition-colors border-l-4 ${!user.estado ? 'bg-slate-50 border-l-slate-300 opacity-60' : 'bg-white border-l-transparent hover:bg-slate-50/50'}`}>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{(user.nombre || "S/N")} {(user.apellido || "")}</div>
                    <div className="text-xs text-slate-400">{user.email || "Sin email"}</div>
                  </td>
                  <td className="px-6 py-4">{user.telefono || "N/A"}</td>
                  <td className="px-6 py-4 truncate max-w-[200px]" title={user.direccion}>{user.direccion || "N/A"}</td>
                  <td className="px-6 py-4 text-center">
                    {user.estado ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold border border-green-200">ACTIVO</span>
                    ) : (
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold border border-slate-200">INACTIVO</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => openModal(user)}
                      className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => user.idUsuario && handleChangeStatus(user.idUsuario)}
                      disabled={!user.idUsuario}
                      className={`p-2 rounded-lg transition-colors ${user.idUsuario ? 'hover:bg-red-50 text-red-500' : 'text-slate-300 cursor-not-allowed'}`}
                      title={user.estado ? "Eliminar (Desactivar)" : "Restaurar (Activar)"}
                    >
                      {user.estado ? <Trash2 size={16} /> : <UserCheck size={16}/>}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FORMULARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">
                {isEditing ? `Editar Usuario #${formData.idUsuario}` : "Nuevo Usuario"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nombre *</label>
                  <input name="nombre" value={formData.nombre} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Apellido</label>
                  <input name="apellido" value={formData.apellido} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Email *</label>
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{isEditing ? "Contraseña (Opcional)" : "Contraseña"}</label>
                <input name="password" type="password" value={formData.password || ""} onChange={handleInputChange} placeholder={isEditing ? "Mantener actual" : "Mínimo 6 caracteres"} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Teléfono</label>
                  <input name="telefono" value={formData.telefono} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Dirección</label>
                  <input name="direccion" value={formData.direccion} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 shadow-lg">
                  {isEditing ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;