import React from "react";
import { ShoppingCart, Heart, Star, PackageX, PackageCheck } from "lucide-react";

export interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    image: string;
    rating: number;
    reviews: number;
    stock?: number; // Importante: Campo de Stock
}

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const stock = product.stock || 0;
    const hasStock = stock > 0;

    return (
        <div className={`group bg-white rounded-2xl border shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col h-full 
      ${hasStock ? 'hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 border-slate-100' : 'border-slate-200 opacity-75'}`}>

            {/* --- STOCK BADGE --- */}
            <div className="absolute top-3 left-3 z-20">
                {hasStock ? (
                    stock < 10 ? (
                        <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-orange-200">
                            <PackageCheck size={10} />
                            ¡Solo {stock} disponibles!
                        </span>
                    ) : (
                        <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-green-200">
                            <PackageCheck size={10} />
                            En Stock: {stock}
                        </span>
                    )
                ) : (
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-slate-200">
                        <PackageX size={10} />
                        Agotado
                    </span>
                )}
            </div>

            {/* --- ACTION OVERLAY --- */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                <button className="p-2.5 bg-white text-slate-400 hover:text-red-500 rounded-full shadow-md transition-colors hover:scale-110">
                    <Heart size={18} />
                </button>
            </div>

            {/* --- IMAGE AREA --- */}
            <div className="relative h-56 w-full bg-white overflow-hidden flex items-center justify-center p-6 border-b border-slate-50">
                {/* Overlay gris si está agotado */}
                {!hasStock && <div className="absolute inset-0 bg-slate-100/50 z-10 backdrop-grayscale" />}

                <img
                    src={"https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.redbubble.com%2Fi%2Fsticker%2FIMAGE-NOT-FOUND-by-ZexyAmbassador%2F142878675.EJUG5&psig=AOvVaw1UHudtnHEkMvpE6rRdpdrl&ust=1763668287264000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCMik6b_-_pADFQAAAAAdAAAAABAE"}
                    alt={product.name}
                    className={`relative z-0 max-h-full max-w-full object-contain transition-transform duration-500 mix-blend-multiply ${hasStock ? 'group-hover:scale-110' : 'grayscale opacity-40'}`}
                    loading="lazy"
                />

                {/* Mensaje Agotado Central */}
                {!hasStock && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <span className="bg-white/90 text-slate-800 text-xs font-bold px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                            PRODUCTO AGOTADO
                        </span>
                    </div>
                )}
            </div>

            {/* --- CONTENT --- */}
            <div className="p-5 flex flex-col flex-1 bg-white">
                <div className="flex items-start justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#4fc3f7] bg-[#e1f5fe] px-2 py-1 rounded-md uppercase tracking-wider">
                        {product.category}
                    </span>
                </div>

                <h3 className={`font-bold text-sm mb-1 line-clamp-2 leading-relaxed transition-colors ${hasStock ? 'text-slate-800 group-hover:text-[#4fc3f7]' : 'text-slate-400'}`}>
                    {product.name}
                </h3>

                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 font-medium">Precio</span>
                        <span className={`text-lg font-extrabold ${hasStock ? 'text-slate-800' : 'text-slate-400'}`}>
                            ${product.price.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                        </span>
                    </div>

                    {/* El botón visual (la lógica real se maneja en Store.tsx o pasando el handler) */}
                    <div
                        className={`p-3 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center ${hasStock
                                ? 'bg-slate-800 text-white'
                                : 'bg-slate-100 text-slate-300 shadow-none'
                            }`}
                    >
                        <ShoppingCart size={18} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;