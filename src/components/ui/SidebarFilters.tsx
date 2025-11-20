import React, { useState, useEffect } from "react";
import { SlidersHorizontal, Check } from "lucide-react";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { Link } from "react-router-dom";

const categories = [
    { name: "Todos", count: 120 },
    { name: "Medicina", count: 45 },
    { name: "Vitaminas", count: 32 },
    { name: "Cuidado Personal", count: 18 },
    { name: "Equipo Medico", count: 12 },
    { name: "Cuidado para Bebe", count: 13 },
];

const SidebarFilters = () => {
    const { filters, setCategory, setPriceRange, setSearchQueryID } = useGlobalContext();

    // Local state
    const [min, setMin] = useState(filters.minPrice);
    const [max, setMax] = useState(filters.maxPrice);

    useEffect(() => {
        setMin(filters.minPrice);
        setMax(filters.maxPrice);
    }, [filters.minPrice, filters.maxPrice]);

    const handleApplyPrice = () => {
        setPriceRange(Number(min), Number(max));
    };

    return (
        <aside className="w-full space-y-6 overflow-clip">

            {/* --- CATEGORIES --- */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <SlidersHorizontal size={16} className="text-[#4fc3f7]" />
                    Categorias
                </h3>
                <ul className="space-y-1">
                    {categories.map((cat, index) => {
                        const isActive = filters.category === cat.name;
                        return (
                            <li key={index}>
                                <button
                                    onClick={() => setCategory(cat.name)}
                                    className={`w-full flex items-center justify-between text-sm py-2.5 px-3 rounded-lg group transition-all duration-200 ${isActive
                                        ? 'bg-[#e1f5fe] text-[#4fc3f7] font-semibold'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {isActive && <Check size={14} />}
                                        <span>{cat.name}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold py-0.5 px-2 rounded-md transition-colors ${isActive
                                        ? 'bg-white text-[#4fc3f7] shadow-sm'
                                        : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:shadow-sm'
                                        }`}>
                                        {cat.count}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
            {/* --- SEARCH BY ID --- */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2 text-sm uppercase tracking-wide">

                    <i className="fa-solid fa-magnifying-glass text-[#4fc3f7]"></i>
                    Buscar por ID
                </h3>
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Ej: 101, 205..."
                        value={filters.searchQueryID ? filters.searchQueryID : ""}
                        onChange={(e) => setSearchQueryID((e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-4 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-[#4fc3f7] focus:ring-2 focus:ring-[#4fc3f7]/20 transition-all"
                    />
                    <i className="fa-solid fa-magnifying-glass absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                </div>
            </div>
            {/* --- PRICE RANGE --- */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-5 text-sm uppercase tracking-wide">Rango de Precio</h3>
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative flex-1 group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 group-focus-within:text-[#4fc3f7] font-bold">$</span>
                        <input
                            type="number"
                            placeholder="0"
                            value={min}
                            onChange={(e) => setMin(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-7 pr-3 text-sm font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-[#4fc3f7] focus:ring-2 focus:ring-[#4fc3f7]/20 transition-all"
                        />
                    </div>
                    <span className="text-slate-300 font-bold">-</span>
                    <div className="relative flex-1 group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 group-focus-within:text-[#4fc3f7] font-bold">$</span>
                        <input
                            type="number"
                            placeholder="1000"
                            value={max}
                            onChange={(e) => setMax(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-7 pr-3 text-sm font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-[#4fc3f7] focus:ring-2 focus:ring-[#4fc3f7]/20 transition-all"
                        />
                    </div>
                </div>
                <button
                    onClick={handleApplyPrice}
                    className="w-full bg-slate-800 hover:bg-[#4fc3f7] text-white text-xs font-bold py-3 rounded-lg uppercase tracking-wide transition-all duration-300 shadow-md hover:shadow-lg transform active:scale-[0.98]"
                >
                    Filtrar
                </button>
            </div>

            {/* --- PROMO BANNER --- */}
            <div className="bg-gradient-to-br from-[#4fc3f7] to-[#66bb6a] rounded-2xl p-6 text-white text-center relative overflow-hidden shadow-lg group">
                <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 transform rotate-45 translate-y-10 group-hover:translate-y-5 transition-transform duration-500"></div>
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>

                <h4 className="font-bold text-xl mb-2 relative z-10">Super Finde!</h4>
                <p className="text-xs mb-5 opacity-90 relative z-10 leading-relaxed">Obten un 20% en Vitaminas y Suplementos. Solo por tiempo limitado.</p>
                <button className="bg-white text-[#4fc3f7] text-xs font-bold py-2.5 px-6 rounded-full hover:bg-slate-50 transition-all shadow-md hover:shadow-lg relative z-10 transform hover:-translate-y-0.5">
                    <a href={"/#top-store"}>Compra ahora</a>
                </button>
            </div>

        </aside>
    );
};

export default SidebarFilters;