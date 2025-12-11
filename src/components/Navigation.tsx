import { NavLink } from "@/components/NavLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faUserCircle,
  faShieldHalved,
  faMagnifyingGlass,
  faXmark,
  faRightFromBracket,
  faUser,
  faBagShopping
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useGlobalContext } from "../hooks/useGlobalContext";

const Navigation = () => {
  const { filters, setSearchQuery, cartCount, user, logout } = useGlobalContext();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // --- INSTANT SEARCH HANDLER ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
  };

  // We keep submit handler just to close mobile menu or prevent page reload
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsMobileSearchOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* LOGO */}
          <div className="flex items-center gap-2 transition-transform hover:scale-105 duration-300 shrink-0">

            <img src="src\assests\isologo.jpg" className="w-10 h-14" alt="Vitalix Plus Isologo" />

            <span className="text-xl font-bold text-slate-800 hidden md:block">Vitalix Plus</span>
            <span className="text-xl font-bold text-slate-800 md:hidden">Vitalix</span>
          </div>

          {/* SEARCH BAR (Desktop) */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={filters.searchQuery}
                onChange={handleInputChange}
                className="w-full bg-slate-100 text-slate-700 rounded-full py-2.5 pl-6 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#4fc3f7]/50 transition-all"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#4fc3f7] hover:bg-[#e1f5fe] rounded-full">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </form>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-4 shrink-0">
            {/* STORE / CART */}
            <NavLink
              to="/"
              className="flex items-center gap-2 text-slate-600 hover:text-[#4fc3f7] transition-colors relative group"
              activeClassName="text-[#4fc3f7] font-medium"
            >
              <div className="relative">
                <FontAwesomeIcon icon={faCartShopping} size="lg" className="group-hover:scale-110 transition-transform" />
              </div>
              <span className="hidden lg:inline text-sm font-medium">Tienda</span>
            </NavLink>

            {user?.email === 'admin@vitalix.com' && (
              <NavLink
                to="/admin"
                className="flex items-center gap-2 text-slate-600 hover:text-[#4fc3f7] transition-colors"
                activeClassName="text-[#4fc3f7] font-medium"
              >
                <FontAwesomeIcon icon={faShieldHalved} size="lg" />
                <span className="hidden lg:inline text-sm font-medium">Admin</span>
              </NavLink>
            )}
            {user?.email === 'domiciliario@vitalix.com' && (
              <NavLink
                to="/driver"
                className="flex items-center gap-2 text-slate-600 hover:text-[#4fc3f7] transition-colors"
                activeClassName="text-[#4fc3f7] font-medium"
              >
                <FontAwesomeIcon icon={faShieldHalved} size="lg" />
                <span className="hidden lg:inline text-sm font-medium">Domiciliario</span>
              </NavLink>
            )}
             {user?.email === 'asistente1@vitalix.com' && (
              <NavLink
                to="/assistant"
                className="flex items-center gap-2 text-slate-600 hover:text-[#4fc3f7] transition-colors"
                activeClassName="text-[#4fc3f7] font-medium"
              >
                <FontAwesomeIcon icon={faShieldHalved} size="lg" />
                <span className="hidden lg:inline text-sm font-medium">Auxiliar</span>
              </NavLink>
            )}
            <button
              className="md:hidden p-2 text-slate-600 hover:text-[#4fc3f7] hover:bg-slate-50 rounded-full transition-colors"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            >
              {isMobileSearchOpen ? <FontAwesomeIcon icon={faXmark} size="lg" /> : <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" />}
            </button>

            {/* LOGIN / USER */}
            {user ? (
              <div className="flex items-center gap-2">
                {/* PROFILE LINK */}
                <NavLink
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors group"
                  activeClassName="bg-slate-50"
                >
                  <span className="text-sm font-semibold text-slate-700 hidden lg:block group-hover:text-[#4fc3f7] transition-colors">
                    Hola, {user.displayName?.split(' ')[0]}
                  </span>
                  <div className="w-8 h-8 bg-[#e1f5fe] text-[#4fc3f7] rounded-full flex items-center justify-center border border-[#4fc3f7]/20">
                    <FontAwesomeIcon icon={faUser} size="sm" />
                  </div>
                </NavLink>

                <button onClick={logout} title="Cerrar Sesión" className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <FontAwesomeIcon icon={faRightFromBracket} size="lg" />
                </button>

                <NavLink to={"/cart"}>
                  <button className="flex items-center gap-2 text-slate-400 hover:text-[#4fc3f7] transition-colors relative group">
                    <FontAwesomeIcon icon={faBagShopping} size="lg" />
                    <div className="relative">
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-in zoom-in">
                          {cartCount > 9 ? '9+' : cartCount}
                        </span>
                      )}  
                    </div>
                  </button>
                </NavLink>
              </div>
            ) : (
              <NavLink
                to="/login"
                end
                className="flex items-center gap-2 text-slate-600 hover:text-[#4fc3f7] transition-colors"
                activeClassName="text-[#4fc3f7] font-medium"
              >
                <FontAwesomeIcon icon={faUserCircle} size="lg" />
                <span className="hidden lg:inline text-sm font-medium">Login</span>
              </NavLink>
            )}


          </div>
        </div>
      </div>

      {
        isMobileSearchOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 shadow-lg p-4 z-40">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                value={filters.searchQuery}
                onChange={handleInputChange}
                autoFocus
                className="w-full bg-slate-100 rounded-full py-2.5 pl-6 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#4fc3f7]/50"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#4fc3f7]">
                <i className="fa-solid fa-magnifying-glass"></i>

              </button>
            </form>
          </div>
        )
      }
    </nav >
  );
};

export default Navigation;