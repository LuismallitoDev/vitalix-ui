import { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { Product } from "../components/ui/storeCard";
import { toast } from "sonner";
import { OrderApi, UserApi } from "../lib/ordersApi";
import { UsuarioDTO, PedidoDTO, OrderItem } from "../lib/types";

// --- TYPES (Frontend) ---
export interface User {
    uid: string;
    email: string;
    displayName: string;
    role: 'admin' | 'user' | 'driver' | 'non-user'; 
    phone?: string;
    address?: string;
    registerDate?: string;
    status?: 'Active' | 'Suspended';
}

export interface CartItem extends Product {
    quantity: number;
}

interface FilterState {
    searchQueryID: string | "";
    searchQuery: string;
    category: string;
    minPrice: number;
    maxPrice: number;
    quantity: number;
    sortOption: string;
}

interface UpdateProfileData {
    displayName: string;
    phone: string;
    address: string;
    password?: string;
}

interface GlobalContextType {
    user: User | null;
    authLoading: boolean;
    login: (email: string, pass: string) => Promise<boolean>;
    register: (name: string, email: string, address: string, pass: string) => Promise<boolean>;
    logout: () => void;
    updateUserProfile: (data: UpdateProfileData) => Promise<boolean>;
    cart: CartItem[];
    addToCart: (product: Product, qty: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, delta: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
    filters: FilterState;
    setSearchQuery: (query: string) => void;
    setCategory: (category: string) => void;
    setPriceRange: (min: number, max: number) => void;
    setSortOption: (option: string) => void;
    setSearchQueryID: (query: string) => void;
    submitOrder: (shippingCost: number, address: string) => Promise<boolean>;
}

export const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) throw new Error("useGlobalContext must be used within a GlobalProvider");
    return context;
};

// --- MAPPER CORREGIDO (Global y cubre todos los casos) ---
const mapDtoToUser = (dto: UsuarioDTO): User => {
    // 1. Mapeo de Roles Backend -> Frontend
    let frontRole: User['role'] = 'user'; // Por defecto

    // Normalizamos a mayúsculas por si acaso
    const rolBackend = (dto.rol || "").toUpperCase();

    if (rolBackend === 'ADMIN') frontRole = 'admin';
    if (rolBackend === 'DOMICILIARIO') frontRole = 'driver';

    // 2. Retorno del Objeto User
    return {
        uid: dto.idUsuario?.toString() || "0",
        email: dto.email || dto.email || "", // Soporte para ambos nombres de campo
        displayName: `${dto.nombre} ${dto.apellido}`,
        role: frontRole,
        phone: dto.telefono,
        address: dto.direccion,
        status: dto.estado ? 'Active' : 'Suspended',
        registerDate: new Date().toISOString()
    };
};

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Persistencia de sesión
    useEffect(() => {
        const storedUser = localStorage.getItem("vitalix_user_session");
        if (storedUser) {
            try { setUser(JSON.parse(storedUser)); }
            catch (e) { localStorage.removeItem("vitalix_user_session"); }
        }
        setAuthLoading(false);
    }, []);

    // --- LOGIN ---
    const login = async (email: string, pass: string): Promise<boolean> => {
        setAuthLoading(true);
        try {
            // 1. Buscar usuario
            const allUsers = await UserApi.getAll();
            const foundDto = allUsers.find(u => (u.email || u.email || "").toLowerCase() === email.toLowerCase());

            if (!foundDto || !foundDto.idUsuario) {
                toast.error("Usuario no encontrado");
                setAuthLoading(false);
                return false;
            }

            // 2. Verificar contraseña
            const dbPasswordResponse = await UserApi.getPassword(foundDto.idUsuario);
            const dbPassword = typeof dbPasswordResponse === 'object' ? (dbPasswordResponse as any).password : dbPasswordResponse;

            if (String(dbPassword) !== pass) {
                toast.error("Contraseña incorrecta");
                setAuthLoading(false);
                return false;
            }

            // 3. Crear sesión usando el mapper global (YA NO HAY DUPLICADO INTERNO)
            const userData = mapDtoToUser(foundDto);

            // Hardcodeo de Admin (Puerta trasera opcional)
            if (email === "admin@vitalix.com") userData.role = 'admin';

            localStorage.setItem("vitalix_user_session", JSON.stringify(userData));
            setUser(userData);

            toast.success(`Bienvenido, ${userData.displayName}`);
            setAuthLoading(false);
            return true;

        } catch (error) {
            console.error("Login error:", error);
            toast.error("Error al iniciar sesión");
            setAuthLoading(false);
            return false;
        }
    };

    // --- REGISTER ---
    const register = async (name: string, email: string, address: string, pass: string): Promise<boolean> => {
        setAuthLoading(true);
        try {
            const parts = name.trim().split(" ");
            const firstName = parts[0];
            const lastName = parts.slice(1).join(" ") || ".";

            const newUserDto = {
                nombre: firstName,
                apellido: lastName,
                email: email,
                correo: email,
                direccion: address,
                password: pass,
                telefono: "Sin registrar",
                rol: "USUARIO",
                estado: true
            };

            // Crear en BD
            const createdUser = await UserApi.create(newUserDto as any);

            // Auto-login con datos reales
            const sessionUser = mapDtoToUser(createdUser);

            localStorage.setItem("vitalix_user_session", JSON.stringify(sessionUser));
            setUser(sessionUser);

            toast.success("Cuenta creada exitosamente");
            setAuthLoading(false);
            return true;

        } catch (error) {
            console.error("Register error:", error);
            toast.error("Error al registrarse.");
            setAuthLoading(false);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem("vitalix_user_session");
        setUser(null);
        toast.info("Sesión cerrada");
        window.location.href = "/login";
    };

    // --- UPDATE PROFILE ---
    const updateUserProfile = async (updatedData: UpdateProfileData): Promise<boolean> => {
        if (!user) return false;
        setAuthLoading(true);

        try {
            const parts = updatedData.displayName.trim().split(" ");
            const firstName = parts[0];
            const lastName = parts.slice(1).join(" ") || "";

            const dto: UsuarioDTO = {
                idUsuario: Number(user.uid),
                nombre: firstName,
                apellido: lastName,
                email: user.email,
                telefono: updatedData.phone,
                direccion: updatedData.address,
                rol: "USUARIO",
                estado: true
            } as any;

            if (updatedData.password && updatedData.password.trim() !== "") {
                dto.password = updatedData.password;
            }

            const response = await UserApi.update(Number(user.uid), dto);
            const updatedUserSession = mapDtoToUser(response);

            if (user.role === 'admin') updatedUserSession.role = 'admin';
            if (user.role === 'driver') updatedUserSession.role = 'driver';

            localStorage.setItem("vitalix_user_session", JSON.stringify(updatedUserSession));
            setUser(updatedUserSession);

            toast.success("Perfil actualizado");
            setAuthLoading(false);
            return true;

        } catch (error) {
            console.error("Update error:", error);
            toast.error("Error al actualizar");
            setAuthLoading(false);
            return false;
        }
    };

    // --- CART STATE (Sin cambios) ---
    const [cart, setCart] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem("vitalix_cart");
        return savedCart ? JSON.parse(savedCart) : [];
    });
    useEffect(() => { localStorage.setItem("vitalix_cart", JSON.stringify(cart)); }, [cart]);

    const addToCart = (product: Product, qty: number = 1) => {
        const availableStock = product.stock || 0;
        if (availableStock <= 0) { toast.error("Producto agotado"); return; }
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                const newTotal = existing.quantity + qty;
                if (newTotal > availableStock) { toast.warning("Stock insuficiente"); return prev; }
                toast.success("Cantidad actualizada");
                return prev.map((item) => item.id === product.id ? { ...item, quantity: newTotal } : item);
            }
            if (qty > availableStock) { toast.warning("Stock insuficiente"); return prev; }
            toast.success("Agregado al carrito");
            return [...prev, { ...product, quantity: qty }];
        });
    };

    const removeFromCart = (id: number) => setCart(prev => prev.filter(i => i.id !== id));

    const updateQuantity = (productId: number, delta: number) => {
        setCart((prev) => prev.map((item) => {
            if (item.id === productId) {
                const newQty = item.quantity + delta;
                return { ...item, quantity: Math.max(0, newQty) };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const clearCart = () => setCart([]);
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // --- FILTER STATE (Sin cambios) ---
    const [filters, setFilters] = useState<FilterState>({
        searchQueryID: "", searchQuery: "", category: "Todos", minPrice: 0, maxPrice: 10000000, quantity: 1, sortOption: "Recomendados",
    });
    const setSearchQuery = (query: string) => setFilters(prev => ({ ...prev, searchQuery: query }));
    const setCategory = (category: string) => setFilters(prev => ({ ...prev, category }));
    const setPriceRange = (min: number, max: number) => setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }));
    const setSortOption = (option: string) => setFilters(prev => ({ ...prev, sortOption: option }));
    const setSearchQueryID = (query: string) => setFilters(prev => ({ ...prev, searchQueryID: query }));

    // --- LIVE ORDERS ---
    const submitOrder = async (shippingCost: number, address: string): Promise<boolean> => {
        if (!user || cart.length === 0) return false;

        const listaIds: number[] = [];
        cart.forEach(item => {
            for (let i = 0; i < item.quantity; i++) {
                listaIds.push(item.id);
            }
        });

        const orderData = {
            idUsuario: Number(user.uid),
            nombreSucursal: "Vitalix Plus - Web",
            idSucursal: 1,
            idAuxiliar: 1,
            idDomiciliario: 1,
            fechaPedido: new Date().toISOString().split('T')[0],
            direccionEntrega: address,
            costoEnvio: shippingCost,
            costoPedido: cartTotal,
            totalPagar: cartTotal + shippingCost,
            listaDeProductos: listaIds,
            estado: "PENDIENTE"
        };

        try {
            await OrderApi.create(orderData as any);
            setCart([]);
            toast.success("Pedido enviado correctamente");
            return true;
        } catch (error) {
            console.error(error);
            toast.error("Error al enviar pedido");
            return false;
        }
    };

    return (
        <GlobalContext.Provider value={{
            user, authLoading, login, register, logout, updateUserProfile,
            cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount,
            filters, setSearchQuery, setCategory, setPriceRange, setSortOption, setSearchQueryID,
            submitOrder
        }}>
            {children}
        </GlobalContext.Provider>
    );
};