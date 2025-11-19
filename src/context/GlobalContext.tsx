import React, { createContext, useState, useEffect, ReactNode } from "react";
import { Product } from "../components/ui/storeCard";
import { toast } from "sonner"; // Ensure sonner is installed

// --- TYPES ---

export interface CartItem extends Product {
    quantity: number;
}

interface FilterState {
    searchQuery: string;
    category: string;
    minPrice: number;
    maxPrice: number;
    sortOption: string;
}

interface GlobalContextType {


    // Cart State
    cart: CartItem[];
    addToCart: (product: Product) => void;
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
}

// --- CONTEXT CREATION ---
export const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    // 1. AUTH STATE

    // 2. CART STATE LOGIC
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = (product: Product) => {
        // Validar Stock Inicial (Si es 0, no dejar agregar)
        if ((product.stock || 0) <= 0) {
            toast.error("Producto agotado", { description: `No hay unidades disponibles de ${product.name}` });
            return;
        }

        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);

            if (existing) {
                // VALIDACIÓN DE STOCK AL INCREMENTAR
                if (existing.quantity + 1 > (product.stock || 0)) {
                    toast.warning("Stock máximo alcanzado", { description: `Solo hay ${product.stock} unidades disponibles.` });
                    return prev; // No hacemos cambios
                }

                toast.success("Cantidad actualizada", { description: `${product.name} (+1)` });
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }

            // Nuevo Item
            toast.success("Producto agregado", { description: `${product.name} añadido al carrito.` });
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
        toast.info("Producto eliminado del carrito");
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === productId) {
                    const newQty = item.quantity + delta;

                    // Validar Stock al subir cantidad manualmente
                    if (delta > 0 && item.stock && newQty > item.stock) {
                        toast.warning("Stock insuficiente", { description: `No puedes agregar más de ${item.stock} unidades.` });
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

    // 3. FILTER STATE
    const [filters, setFilters] = useState<FilterState>({
        searchQuery: "",
        category: "All Products",
        minPrice: 0,
        maxPrice: 1000000,
        sortOption: "Recommended"
    });

    const setSearchQuery = (query: string) => setFilters(prev => ({ ...prev, searchQuery: query }));
    const setCategory = (category: string) => setFilters(prev => ({ ...prev, category }));
    const setPriceRange = (min: number, max: number) => setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }));
    const setSortOption = (option: string) => setFilters(prev => ({ ...prev, sortOption: option }));

    return (
        <GlobalContext.Provider value={{
            cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount,
            filters, setSearchQuery, setCategory, setPriceRange, setSortOption
        }}>
            {children}
        </GlobalContext.Provider>
    );
};