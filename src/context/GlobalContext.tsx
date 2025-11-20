import { createContext, useState, useEffect, ReactNode } from "react";
import { Product } from "../components/ui/storeCard";
import { toast } from "sonner";

// --- TYPES ---
export interface User {
    uid: string;
    email: string;
    displayName: string;
    role: 'admin' | 'user' | 'non-user';
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
    sortOption: string;
}

interface GlobalContextType {
    // Auth State
    user: User | null;
    authLoading: boolean;
    login: (email: string, pass: string) => Promise<boolean>;
    register: (name: string, email: string, pass: string) => Promise<boolean>;
    logout: () => void;

    // Cart State
    cart: CartItem[];
    addToCart: (product: Product, qty: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, delta: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;

    // Filter State
    filters: FilterState;
    setSearchQuery: (query: string) => void;
    setCategory: (category: string) => void;
    setPriceRange: (min: number, max: number) => void;
    setSortOption: (option: string) => void;
    setSearchQueryID: (query: string) => void;
}

// --- CONTEXT CREATION ---
export const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const GlobalProvider = ({ children }: { children: ReactNode }) => {

    // --- 1. AUTH STATE ---
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Check LocalStorage on Mount
    useEffect(() => {
        const storedUser = localStorage.getItem("vitalix_user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from storage");
                localStorage.removeItem("vitalix_user");
            }
        }
        setAuthLoading(false);
    }, []);

    const login = async (email: string, pass: string): Promise<boolean> => {
        setAuthLoading(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // --- HARDCODED ADMIN CHECK ---
        if (email === "admin@vitalix.com" && pass === "admin123") {
            const adminUser: User = {
                uid: "admin-001",
                email: "admin@vitalix.com",
                displayName: "Administrator",
                role: "admin" // Grant Admin Role
            };
            localStorage.setItem("vitalix_user", JSON.stringify(adminUser));
            setUser(adminUser);
            toast.success("Bienvenido, Administrador");
            setAuthLoading(false);
            return true;
        }

        // 1. Get registered users from storage
        const usersDb = JSON.parse(localStorage.getItem("vitalix_users_db") || "[]");

        // 2. Find regular user
        const foundUser = usersDb.find((u) => u.email === email && u.password === pass);

        if (foundUser) {
            const userData: User = {
                uid: foundUser.uid,
                email: foundUser.email,
                displayName: foundUser.name,
                role: "user" // Default role
            };

            // 3. Set Active Session
            localStorage.setItem("vitalix_user", JSON.stringify(userData));
            setUser(userData);
            toast.success(`Bienvenido de nuevo, ${userData.displayName}`);
            setAuthLoading(false);
            return true;
        } else {
            toast.error("Credenciales incorrectas");
            setAuthLoading(false);
            return false;
        }
    };

    const register = async (name: string, email: string, pass: string): Promise<boolean> => {
        setAuthLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        const usersDb = JSON.parse(localStorage.getItem("vitalix_users_db") || "[]");

        if (usersDb.find((u) => u.email === email)) {
            toast.error("El correo ya está registrado");
            setAuthLoading(false);
            return false;
        }

        const newUser = {
            uid: Date.now().toString(),
            name,
            email,
            password: pass
        };

        usersDb.push(newUser);
        localStorage.setItem("vitalix_users_db", JSON.stringify(usersDb));

        // Auto-login as regular user
        const sessionUser: User = {
            uid: newUser.uid,
            email: newUser.email,
            displayName: newUser.name,
            role: "user"
        };
        localStorage.setItem("vitalix_user", JSON.stringify(sessionUser));
        setUser(sessionUser);

        toast.success("Cuenta creada exitosamente");
        setAuthLoading(false);
        return true;
    };

    const logout = () => {
        localStorage.removeItem("vitalix_user");
        setUser(null);
        toast.info("Sesión cerrada");
    };

    // --- CART STATE ---
    const [cart, setCart] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem("vitalix_cart");
        return savedCart ? JSON.parse(savedCart) : [];
    });
    useEffect(() => { localStorage.setItem("vitalix_cart", JSON.stringify(cart)); }, [cart]);


    const addToCart = (product: Product, qty: number = 1) => {
        const availableStock = product.stock || 0;

        if (availableStock <= 0) {
            toast.error("Producto agotado");
            return;
        }

        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);

            if (existing) {
                const newTotal = existing.quantity + qty;
                if (newTotal > availableStock) {
                    toast.warning(`Stock insuficiente. Solo hay ${availableStock} unidades.`);
                    return prev;
                }
                toast.success("Cantidad actualizada");
                return prev.map((item) => item.id === product.id ? { ...item, quantity: newTotal } : item);
            }

            if (qty > availableStock) {
                toast.warning(`Stock insuficiente. Solo hay ${availableStock} unidades.`);
                return prev;
            }

            toast.success("Agregado al carrito");
            return [...prev, { ...product, quantity: qty }];
        });
    };

    const removeFromCart = (id: number) => setCart(prev => prev.filter(i => i.id !== id));

    const updateQuantity = (productId: number, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === productId) {
                    const newQty = item.quantity + delta;
                    // We also need to check stock here if delta is positive, but for now let's keep it simple or pass stock in CartItem
                    const limit = item.stock || 100;
                    if (newQty > limit) {
                        toast.warning("Stock máximo alcanzado");
                        return item;
                    }
                    return { ...item, quantity: Math.max(0, newQty) };
                }
                return item;
            }).filter(item => item.quantity > 0)
        );
    };

    const clearCart = () => setCart([]);
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // --- 3. FILTER STATE ---
    const [filters, setFilters] = useState<FilterState>({
        searchQueryID: "",
        searchQuery: "",
        category: "Todos",
        minPrice: null,
        maxPrice: 10000000,
        sortOption: "Recomendados"
    });

    const setSearchQuery = (query: string) => setFilters(prev => ({ ...prev, searchQuery: query }));
    const setCategory = (category: string) => setFilters(prev => ({ ...prev, category }));
    const setPriceRange = (min: number, max: number) => setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }));
    const setSortOption = (option: string) => setFilters(prev => ({ ...prev, sortOption: option }));
    const setSearchQueryID = (query: string) => setFilters(prev => ({ ...prev, searchQueryID: query }));

    return (
        <GlobalContext.Provider value={{
            user, authLoading, login, register, logout,
            cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount,
            filters, setSearchQuery, setCategory, setPriceRange, setSortOption, setSearchQueryID
        }}>
            {children}
        </GlobalContext.Provider>
    );
};