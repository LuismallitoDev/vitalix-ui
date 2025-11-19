import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/pages/Footer";
import ProductCard, { Product } from "@/components/ui/storeCard";
import SidebarFilters from "@/components/ui/SidebarFilters";
import { ArrowUpDown, Loader2, AlertCircle, ChevronRight } from "lucide-react";
import { getProducts, RawProduct } from "@/lib/api";
import { useGlobalContext } from "../hooks/useGlobalContext";

const Store = () => {
  const { filters, setSortOption, addToCart } = useGlobalContext(); // Importamos addToCart

  // 1. FETCH DATA
  const { data: rawProducts, isLoading, error } = useQuery<RawProduct[]>({
    queryKey: ['products'],
    queryFn: getProducts,
    staleTime: 1000 * 60, // 1 minuto de cache
  });

  // 2. MAP DATA (Backend -> Frontend)
  const products: Product[] = useMemo(() => {
    if (!rawProducts) return [];

    return rawProducts.map((item) => ({
      id: item.código,
      name: item.descripción,
      category: "General", // Asigna una categoría por defecto si el backend no la provee
      price: item.total_precio,
      image: "https://via.placeholder.com/300", // Placeholder
      rating: 0,
      reviews: 0,
      // MAPEO CRÍTICO: Usamos s._ent como stock
      stock: item["s._ent"]
    }));
  }, [rawProducts]);

  // --- FILTERING LOGIC ---
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (filters.category !== "All Products" && product.category !== filters.category) return false;
      if (filters.searchQuery && !product.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
      if (filters.maxPrice > 0 && (product.price < filters.minPrice || product.price > filters.maxPrice)) return false;
      return true;
    }).sort((a, b) => {
      if (filters.sortOption === "Price: Low to High") return a.price - b.price;
      if (filters.sortOption === "Price: High to Low") return b.price - a.price;
      return 0;
    });
  }, [filters, products]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-['Montserrat',sans-serif] text-slate-700">
      <Navigation />

      <div className="bg-white border-b border-slate-200 pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <span>Inicio</span>
            <ChevronRight size={12} />
            <span className="text-slate-800 font-semibold">Tienda</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Nuestra Tienda</h1>
          <p className="text-slate-500 text-sm max-w-2xl">
            Explora nuestro catálogo de productos farmacéuticos con inventario en tiempo real.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 relative items-start">

          <div className="hidden lg:block w-64 flex-shrink-0 sticky top-24 z-10">
            <SidebarFilters />
          </div>

          <div className="lg:hidden w-full">
            <SidebarFilters />
          </div>

          <div className="flex-1 min-w-0">
            {/* Controls Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <p className="text-sm text-slate-500">
                Mostrando <span className="font-bold text-slate-800">{filteredProducts.length}</span> resultados
              </p>
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Ordenar Por:</span>
                <div className="relative">
                  <select
                    value={filters.sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:border-[#4fc3f7] cursor-pointer shadow-sm"
                  >
                    <option>Recommended</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest Arrivals</option>
                  </select>
                  <ArrowUpDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* States */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-slate-100">
                <Loader2 className="h-10 w-10 text-[#4fc3f7] animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Cargando inventario...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-red-100">
                <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Error al cargar productos</h3>
                <p className="text-slate-500 text-sm">Verifica tu conexión al servidor.</p>
              </div>
            )}

            {/* PRODUCTS GRID */}
            {!isLoading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const hasStock = (product.stock || 0) > 0;

                  return (
                    <div key={product.id} className="relative h-full">
                      <ProductCard product={product} />

                      {/* BOTÓN DE ACCIÓN SUPERPUESTO */}
                      {/* Solo funcional si hay stock */}
                      <button
                        disabled={!hasStock}
                        onClick={() => addToCart(product)}
                        className={`absolute bottom-5 right-5 z-20 p-3 rounded-xl shadow-md transition-all duration-200 active:scale-95
                                            ${hasStock
                            ? 'bg-[#4fc3f7] hover:bg-[#29b6f6] text-white cursor-pointer opacity-0 hover:opacity-100 focus:opacity-100' // Oculto hasta hover
                            : 'hidden' // Ocultar botón si no hay stock
                          }`}
                      >
                        <span className="sr-only">Agregar</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /><path d="M12 10v6" /><path d="M9 13h6" /></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Store;