import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/pages/Footer";
import ProductCard, { Product } from "@/components/ui/storeCard";
import SidebarFilters from "@/components/ui/SidebarFilters";
import { getProducts, RawProduct } from "@/lib/api";
import { useGlobalContext } from "../hooks/useGlobalContext";

const Store = () => {
  const { filters, setSortOption, addToCart } = useGlobalContext();

  // 1. FETCH DATA
  const { data: rawProducts, isLoading, error } = useQuery<RawProduct[]>({
    queryKey: ['products'],
    queryFn: getProducts,
    staleTime: 1000 * 60,
  });

  // 2. MAP DATA 
  // Note: We removed 'image' from here because the ProductCard now fetches it individually.
  const products: Product[] = useMemo(() => {
    if (!rawProducts) return [];

    return rawProducts.map((item) => ({
      id: item.código,
      name: item.descripción,
      category: "General",
      price: item.total_precio,
      rating: 0,
      reviews: 0,
      stock: item["s._ent"]
    }));
  }, [rawProducts]);

  // 3. FILTER DATA
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (filters.category !== "Todos" && product.category !== filters.category) return false;
      if (filters.searchQuery && !product.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
      if (filters.maxPrice > 0 && (product.price < filters.minPrice || product.price > filters.maxPrice)) return false;
      if (filters.searchQueryID) {

        if (!product.id.toString().includes(filters.searchQueryID)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (filters.sortOption === "Precio: Menor a Mayor") return a.price - b.price;
      if (filters.sortOption === "Precio: Mayor a Menor") return b.price - a.price;
      return 0;
    });
  }, [filters, products]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-['Montserrat',sans-serif] text-slate-700">
      <Navigation />

      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 pt-24 pb-8"  id="top-store">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <span>Inicio</span>
            <i className="fa-solid fa-chevron-right text-[10]"></i>
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

          {/* SIDEBAR */}
          <div className="hidden lg:block w-64 flex-shrink-0 sticky top-24 z-10">
            <SidebarFilters />
          </div>
          <div className="lg:hidden w-full">
            <SidebarFilters />
          </div>

          {/* GRID CONTENT */}
          <div className="flex-1 min-w-0">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <p className="text-sm text-slate-500">
                Mostrando <span className="font-bold text-slate-800">{filteredProducts.length}</span> resultados
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Ordenar:</span>
                <div className="relative">
                  <select
                    value={filters.sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:border-[#4fc3f7] cursor-pointer"
                  >
                    <option>Recomendado</option>
                    <option>Precio: Menor a Mayor</option>
                    <option>Precio: Mayor a Menor</option>
                  </select>
                  <i className="fa-solid fa-sort absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>

                </div>
              </div>
            </div>

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-32">
                <i className="fa-solid fa-spinner h-50 w-50 text-[#4fc3f7] animate-spin mb-4"></i>

                <p>Cargando productos...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-32 text-red-500">
                <i className="fa-solid fa-circle-exclamation h-8 w-8 mb-4"></i>

                <p>Error al cargar inventario.</p>
              </div>
            )}

            {!isLoading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="relative h-full">
                    <ProductCard
                      product={product}
                      onAddToCart={() => addToCart(product)}
                    />
                  </div>
                ))}
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