import React from "react";
import { useQuery } from "@tanstack/react-query"; 
import { getImages } from "@/lib/imageApi";
import { useGlobalContext } from "@/hooks/useGlobalContext";


export interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    rating: number;
    reviews: number;
    stock?: number;
}

interface ProductCardProps {
    product: Product;
    onAddToCart?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
    const stock = product.stock || 0;
    const hasStock = stock > 0;
    const isLowStock = stock > 0 && stock < 10;
    const { user } = useGlobalContext();
    // --- FETCH IMAGE QUERY ---
    const { data: images, isLoading: imgLoading } = useQuery({
        queryKey: ['product-image', product.id],
        queryFn: () => getImages(product.id),
        staleTime: 1000 * 60 * 10, // Cache for 10 mins
        retry: 1
    });

    const handleCartIncrease = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            alert("No has inicado sesión");
            window.location.href = "/login";
            return
        }
        if (hasStock && onAddToCart) {
            onAddToCart();
        }
    }
    // Get the first image URL if available
    const imageUrl = images && images.length > 0 ? images[0].url : null;
    const fallbackImage = "https://ih1.redbubble.net/image.4905811472.8675/st,extra_large,507x507-pad,600x600,f8f8f8.jpg";

    return (
        <div className={`group bg-white rounded-2xl border shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col h-full 
      ${hasStock ? 'hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 border-slate-100' : 'border-slate-200 opacity-75'}`}>

            {/* --- STOCK BADGE --- */}
            <div className="absolute top-3 left-3 z-20">
                {!hasStock ? (
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-slate-200 shadow-sm">
                        <i className="fa-solid fa-box-open"></i>
                        Agotado
                    </span>
                ) : isLowStock ? (
                    <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-orange-200 shadow-sm animate-pulse">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        ¡Solo {stock} disponibles!
                    </span>
                ) : (
                    <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-green-200 shadow-sm">
                        <i className="fa-solid fa-circle-check"></i>
                        En Stock: {stock}
                    </span>
                )}
            </div>

            {/* --- FAVORITE BUTTON --- */}
            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                <button className="w-8 h-8 flex items-center justify-center bg-white text-slate-400 hover:text-red-500 rounded-full shadow-md transition-colors hover:scale-110">
                    <i className="fa-regular fa-heart"></i>
                </button>
            </div>

            {/* --- IMAGE AREA --- */}
            <div className="relative h-56 w-full bg-white overflow-hidden flex items-center justify-center p-6 border-b border-slate-50">
                {!hasStock && <div className="absolute inset-0 bg-slate-50/60 z-10 backdrop-grayscale" />}

                {imgLoading ? (
                    // Loading Skeleton
                    <div className="w-full h-full bg-slate-100 animate-pulse rounded-md"></div>
                ) : (
                    <img
                        src={imageUrl || fallbackImage}
                        alt={product.name}
                        className={`relative z-0 max-h-full max-w-full object-contain transition-transform duration-500 mix-blend-multiply ${hasStock ? 'group-hover:scale-110' : 'grayscale opacity-40'}`}
                        loading="lazy"
                        onError={(e) => {
                            // Fallback if image URL breaks
                            (e.target as HTMLImageElement).src = fallbackImage;
                        }}
                    />
                )}

                {!hasStock && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <span className="bg-white/90 text-slate-800 text-xs font-bold px-4 py-2 rounded-lg shadow-md border border-slate-200">
                            PRODUCTO AGOTADO
                        </span>
                    </div>
                )}
            </div>

            {/* --- INFO --- */}
            <div className="p-5 flex flex-col flex-1 bg-white">
                <div className="flex items-start justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#4fc3f7] bg-[#e1f5fe] px-2 py-1 rounded-md uppercase tracking-wider">
                        {product.category}
                    </span>
                    {product.rating > 0 && (
                        <div className="flex items-center gap-1 text-yellow-400 text-xs">
                            <i className="fa-solid fa-star"></i>
                            <span className="font-bold text-slate-700">{product.rating}</span>
                        </div>
                    )}
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

                    <button
                        disabled={!hasStock}
                        onClick={handleCartIncrease}
                        className={`w-10 h-10 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center ${hasStock
                            ? 'bg-slate-800 text-white hover:bg-[#4fc3f7] cursor-pointer active:scale-95'
                            : 'bg-slate-100 text-slate-300 shadow-none cursor-not-allowed'
                            } `}
                    >
                        <i className="fa-solid fa-cart-shopping"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;