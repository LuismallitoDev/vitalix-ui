import { NavLink } from "@/components/NavLink";
import { Pill, ShoppingCart, UserCircle, Shield, Search, X, LogOut } from "lucide-react";
import { useContext, useState } from "react";
import { useGlobalContext } from "../hooks/useGlobalContext";

const Navigation = () => {
  const [user, setUser] = useState(true);
  // Recuperamos cartCount y user del contexto
  const { filters, setSearchQuery, cartCount } = useGlobalContext();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState(filters.searchQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localQuery);
    setIsMobileSearchOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* LOGO */}
          <div className="flex items-center gap-2 transition-transform hover:scale-105 duration-300 shrink-0">
            <Pill className="h-7 w-7 text-[#4fc3f7]" />
            <span className="text-xl font-bold text-slate-800 hidden md:block">Vitalix Plus</span>
            <span className="text-xl font-bold text-slate-800 md:hidden">Vitalix</span>
          </div>

          {/* SEARCH BAR (Desktop) */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Buscar productos, medicinas..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="w-full bg-slate-100 text-slate-700 placeholder:text-slate-400 rounded-full py-2.5 pl-6 pr-12 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#4fc3f7]/50 transition-all"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#4fc3f7] hover:bg-[#e1f5fe] rounded-full transition-colors">
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Mobile Search Toggle */}
            <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}>
              {isMobileSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>

            {/* LOGIN / USER STATE */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700 hidden lg:block">Hola, Usuario</span>
                <button title="Cerrar Sesión" className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <LogOut className="h-5 w-5" onClick={() => setUser(false)} />
                </button>
              </div>
            ) : (
              <NavLink to="/login" className="flex items-center gap-2 text-slate-600 hover:text-[#4fc3f7] transition-colors">
                <UserCircle className="h-6 w-6" />
                <span className="hidden lg:inline text-sm font-medium">Login</span>
              </NavLink>
            )}

            {/* STORE / CART BADGE */}
            <NavLink to="/" className="flex items-center gap-2 text-slate-600 hover:text-[#4fc3f7] transition-colors relative group">
              <div className="relative">
                <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-in zoom-in">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline text-sm font-medium">Tienda</span>
            </NavLink>

            <NavLink to="/admin" className="flex items-center gap-2 text-slate-600 hover:text-[#4fc3f7] transition-colors">
              <Shield className="h-6 w-6" />
              <span className="hidden lg:inline text-sm font-medium">Admin</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Mobile Search Dropdown */}
      {isMobileSearchOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 shadow-lg p-4 z-40">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              autoFocus
              className="w-full bg-slate-100 rounded-full py-2.5 pl-6 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#4fc3f7]/50"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#4fc3f7]">
              <Search className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}
    </nav>
  );
};

export default Navigation;