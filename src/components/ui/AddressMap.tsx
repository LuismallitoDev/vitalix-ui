import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { Loader2, MapPinOff } from 'lucide-react';

// Corrección de iconos de Leaflet para React (necesaria para que se vean los pines)
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerIcon2xPng from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const customIcon = new Icon({
    iconUrl: markerIconPng,
    iconRetinaUrl: markerIcon2xPng,
    shadowUrl: markerShadowPng,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Componente auxiliar para mover la cámara cuando cambian las coordenadas
const MapUpdater = ({ position }: { position: [number, number] }) => {
    const map = useMap();
    map.flyTo(position, 16); // Zoom nivel calle
    return null;
};

interface AddressMapProps {
    address: string;
}

const AddressMap: React.FC<AddressMapProps> = ({ address }) => {
    const [coords, setCoords] = useState<[number, number] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    // Centro por defecto (Medellín)
    const defaultCenter: [number, number] = [6.2442, -75.5812];

    useEffect(() => {
        const fetchCoordinates = async () => {
            if (!address || address.length < 5) return;
            
            setLoading(true);
            setError(false);
            
            try {
                // Usamos Nominatim (OpenStreetMap) que es GRATIS
                // Limitamos la búsqueda a Colombia para mejor precisión
                const query = `${address}, Medellín, Colombia`;
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                const data = await response.json();

                if (data && data.length > 0) {
                    setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Error geocoding:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        // Debounce de 1 segundo para no saturar la API mientras escribes
        const timeoutId = setTimeout(() => {
            fetchCoordinates();
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [address]);

    return (
        <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200 relative z-0 mt-4 shadow-inner">
            {loading && (
                <div className="absolute inset-0 bg-white/80 z-[1000] flex items-center justify-center text-xs text-slate-500 font-bold backdrop-blur-sm">
                    <Loader2 className="animate-spin mr-2 w-4 h-4 text-blue-500"/> Ubicando en el mapa...
                </div>
            )}
            
            {error && !loading && (
                <div className="absolute inset-0 bg-slate-50 z-[1000] flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                    <MapPinOff size={24} className="mb-2 opacity-50"/>
                    <span className="text-xs">No pudimos ubicar la dirección exacta.</span>
                </div>
            )}

            <MapContainer 
                center={defaultCenter} 
                zoom={13} 
                style={{ height: "100%", width: "100%" }} 
                scrollWheelZoom={false} // Para no molestar al scrollear el modal
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {coords && (
                    <>
                        <Marker position={coords} icon={customIcon}>
                            <Popup>{address}</Popup>
                        </Marker>
                        <MapUpdater position={coords} />
                    </>
                )}
            </MapContainer>
        </div>
    );
};

export default AddressMap;