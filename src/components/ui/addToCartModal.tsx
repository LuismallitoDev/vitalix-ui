import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/components/ui/storeCard";
import { getImages } from "@/lib/imageApi";

interface AddToCartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (qty: number) => void;
    product: Product | null;
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({ isOpen, onClose, onConfirm, product }) => {

    const [quantity, setQuantity] = useState(1);
    const productId = product?.id; // Safe access for the hook

    // We use 'enabled' to prevent the query from running if there is no product
    const { data: images, isLoading: imgLoading } = useQuery({
        queryKey: ['product-image', productId],
        queryFn: () => getImages(productId!), // Non-null assertion safe due to 'enabled'
        staleTime: 1000 * 60 * 10,
        retry: 1,
        enabled: !!productId && isOpen // Only fetch if we have a product ID AND modal is open
    });

    // Reset quantity when modal opens with a new product
    useEffect(() => {
        if (isOpen) setQuantity(1);
    }, [isOpen, product]);

    // 2. NOW we can return null if closed
    if (!isOpen || !product) return null;

    // Get the first image URL if available
    const imageUrl = images && images.length > 0 ? images[0].url : null;
    const fallbackImage = "https://ih1.redbubble.net/image.4905811472.8675/st,extra_large,507x507-pad,600x600,f8f8f8.jpg";

    const stock = product.stock || 0;

    const handleIncrement = () => {
        if (quantity < stock) {
            setQuantity(prev => prev + 1);
        }
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleConfirm = () => {
        if (quantity > 0 && quantity <= stock) {
            onConfirm(quantity);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-lg">Agregar al Carrito</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex gap-6">
                    {/* Product Image Thumb */}
                    <div className="w-24 h-24 bg-white border border-slate-100 rounded-lg flex items-center justify-center p-2 flex-shrink-0 relative overflow-hidden">
                        {imgLoading ? (
                            <div className="w-full h-full bg-slate-100 animate-pulse rounded-md"></div>
                        ) : (
                            <img
                                src={imageUrl || fallbackImage}
                                alt={product.name}
                                className="max-w-full max-h-full object-contain mix-blend-multiply"
                                loading="lazy"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = fallbackImage;
                                }}
                            />
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                        <h4 className="font-bold text-slate-700 mb-1 line-clamp-2">{product.name}</h4>
                        <p className="text-sm text-slate-500 mb-4">Disponible: <span className="font-bold text-[#4fc3f7]">{stock}</span></p>

                        <div className="flex items-center justify-between">
                            {/* Quantity Control */}
                            <div className="flex items-center border border-slate-200 rounded-lg">
                                <button
                                    onClick={handleDecrement}
                                    disabled={quantity <= 1}
                                    className="px-3 py-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors border-r border-slate-200"
                                >
                                    <i className="fa-solid fa-minus"></i>
                                </button>
                                <span className="w-10 text-center font-bold text-slate-700 text-sm">{quantity}</span>
                                <button
                                    onClick={handleIncrement}
                                    disabled={quantity >= stock}
                                    className="px-3 py-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors border-l border-slate-200"
                                >
                                    <i className="fa-solid fa-plus"></i>
                                </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                                <p className="text-xs text-slate-400">Total</p>
                                <p className="font-bold text-slate-800 text-lg">
                                    ${(product.price * quantity).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-[#4fc3f7] hover:bg-[#29b6f6] rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <i className="fa-solid fa-cart-plus"></i>

                        Agregar {quantity} Item(s)
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddToCartModal;