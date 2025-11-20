import { NavLink } from "@/components/NavLink";
import { useState } from "react";
import { useGlobalContext } from "../hooks/useGlobalContext";

const Navigation = () => {
  const { filters, setSearchQuery, cartCount, user, logout } = useGlobalContext();
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

            <i className="fa-solid fa-capsules h-7 w-7 text-[#4fc3f7]"></i>
            <span className="text-xl font-bold text-slate-800 hidden md:block">Vitalix Plus</span>
            <span className="text-xl font-bold text-slate-800 md:hidden">Vitalix</span>
          </div>

          {/* SEARCH BAR (Desktop) */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="w-full bg-slate-100 text-slate-700 rounded-full py-2.5 pl-6 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#4fc3f7]/50 transition-all"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#4fc3f7] hover:bg-[#e1f5fe] rounded-full">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </form>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-4 shrink-0">
            <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}>

              <i className={`fa-solid ${isMobileSearchOpen ? "fa-xmark" : "fa-magnifying-glass"}`}></i>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700 hidden lg:block">Hola, {user.displayName?.split(' ')[0] || 'Usuario'}</span>
                <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Cerrar Sesión">
                  <i className="fa-solid fa-right-from-bracket"></i>
                </button>
              </div>
            ) : (
              <NavLink to="/login" className="flex items-center gap-2 text-slate-600 hover:text-[#4fc3f7] transition-colors">
                <i className="fa-solid fa-circle-user"></i>
                <span className="hidden lg:inline text-sm font-medium">Login</span>
              </NavLink>
            )}

            <NavLink to="/" className="flex items-center gap-2 text-slate-600 hover:text-[#4fc3f7] transition-colors relative group">
              <div className="relative">
                <i className="fa-solid fa-cart-shopping group-hover:scale-110 transition-transform"></i>

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-in zoom-in">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline text-sm font-medium">Tienda</span>
            </NavLink>

            {/* ADMIN LINK (Visible only to Admin Role) */}
            {user?.role === 'admin' && (
              <NavLink to="/admin" className="flex items-center gap-2 text-slate-600 hover:text-[#4fc3f7] transition-colors">
                <i className="fa-solid fa-shield-halved"></i>
                <span className="hidden lg:inline text-sm font-medium">Admin</span>
              </NavLink>
            )}

          </div>
        </div>
      </div>

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
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#4fc3f7]">
              <i className="fa-solid fa-magnifying-glass"></i>

            </button>
          </form>
        </div>
      )}
    </nav>
  );
};

export default Navigation;