import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/pages/Footer";
import ProductCard, { Product } from "@/components/ui/storeCard";
import SidebarFilters from "@/components/ui/SidebarFilters";
import { getProducts, RawProduct } from "@/lib/api";
import { useGlobalContext } from "../hooks/useGlobalContext";
import AddToCartModal from "@/components/ui/addToCartModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronLeft,
  faFilter,
  faSpinner,
  faSort,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
const Store = () => {
  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // --- USE STATES / INITIAL STATES --- //
  const { filters, setSortOption, addToCart } = useGlobalContext();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 1. FETCH DATA
  const { data: rawProducts, isLoading, error } = useQuery<RawProduct[]>({
    queryKey: ['products'],
    queryFn: getProducts,
    staleTime: 1000 * 60,
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);
  // 2. MAP DATA 
  const products: Product[] = useMemo(() => {
    if (!rawProducts) return [];

    return rawProducts.map((item) => ({
      id: item.código,
      name: item.descripción,
      price: item.total_precio,
      rating: 0,
      reviews: 0,
      stock: item["s._ent"],
      category: item.categoría,
    }));
  }, [rawProducts]);

  // 3. FILTER DATA
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (filters.sortOption === "Cantidad: No agotados" && product.stock <= 0) {
        return false;
      }
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
      if (filters.sortOption === "Cantidad: No agotados") return b.stock - a.stock;

      return 0;
    });
  }, [filters, products]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on change
    }
  };

  // 4. HANDLERS
  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleConfirmAddToCart = (qty: number) => {
    if (selectedProduct) {
      addToCart(selectedProduct, qty);
    }
  };
  return (
    <div className="min-h-screen bg-[#f8f9fa] font-['Montserrat',sans-serif] text-slate-700">
      <Navigation />

      {/* --- MODAL --- */}
      <AddToCartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAddToCart}
        product={selectedProduct}
      />

      <div className="bg-white border-b border-slate-200 pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <span>Inicio</span>
            <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
            <span className="text-slate-800 font-semibold">Tienda</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Nuestra Tienda</h1>
          <p className="text-slate-500 text-sm max-w-2xl">
            Explora nuestro catálogo de productos farmacéuticos con inventario en tiempo real.
          </p>

          <button
            className="lg:hidden mt-4 w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg font-medium shadow-sm hover:bg-slate-50 transition-colors"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <FontAwesomeIcon icon={faFilter} className="text-[#4fc3f7]" />
            {isFiltersOpen ? "Ocultar Filtros" : "Mostrar Filtros"}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 relative items-start">

          <div className={`lg:block w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-24 z-10 ${isFiltersOpen ? 'block' : 'hidden'}`}>
            <SidebarFilters products={products} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Controls... */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <p className="text-sm text-slate-500">
                Mostrando <span className="font-bold text-slate-800">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)}</span> de <span className="font-bold text-slate-800">{filteredProducts.length}</span> resultados
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Ordenar:</span>
                <div className="relative w-full sm:w-auto">
                  <select
                    value={filters.sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full sm:w-auto appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:border-[#4fc3f7] cursor-pointer"
                  >
                    <option>Recomendados</option>
                    <option>Precio: Menor a Mayor</option>
                    <option>Precio: Mayor a Menor</option>
                    <option>Cantidad: No agotados</option>
                  </select>
                  <FontAwesomeIcon icon={faSort} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-32">
                <FontAwesomeIcon icon={faSpinner} className="h-10 w-10 text-[#4fc3f7] animate-spin mb-4" />
                <p>Cargando productos...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-32 text-red-500">
                <FontAwesomeIcon icon={faCircleExclamation} className="h-8 w-8 mb-4" />
                <p>Error al cargar inventario.</p>
              </div>
            )}

            {!isLoading && !error && (
              <>
                {/* PRODUCTS GRID - USING CURRENT PAGE DATA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {currentProducts.map((product) => (
                    <div key={product.id} className="relative h-full">
                      <ProductCard
                        product={product}
                        onAddToCart={() => openModal(product)}
                      />
                    </div>
                  ))}
                </div>

                {/* --- PAGINATION CONTROLS --- */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </button>

                    {/* Page Numbers (Simplified: First, Current, Last) */}
                    <div className="flex items-center gap-1">
                      {/* Always show page 1 */}
                      <button
                        onClick={() => handlePageChange(1)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors ${currentPage === 1 ? 'bg-[#4fc3f7] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        1
                      </button>

                      {/* Ellipsis if far from start */}
                      {currentPage > 3 && <span className="text-slate-400 px-1">...</span>}

                      {/* Current Page Neighbors */}
                      {currentPage > 1 && currentPage < totalPages && (
                        <button
                          className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#4fc3f7] text-white font-bold shadow-md pointer-events-none"
                        >
                          {currentPage}
                        </button>
                      )}

                      {/* Ellipsis if far from end */}
                      {currentPage < totalPages - 2 && <span className="text-slate-400 px-1">...</span>}

                      {/* Always show Last Page */}
                      {totalPages > 1 && (
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors ${currentPage === totalPages ? 'bg-[#4fc3f7] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                          {totalPages}
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                  </div>
                )}

                {filteredProducts.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-slate-400">No se encontraron productos.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Store;