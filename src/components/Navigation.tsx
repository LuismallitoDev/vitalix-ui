import { NavLink } from "@/components/NavLink";
import { Pill, ShoppingCart, UserCircle, Shield } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Pill className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground">PharmaCare</span>
          </div>
          
          <div className="flex items-center gap-6">
            <NavLink
              to="/"
              end
              className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors"
              activeClassName="text-primary font-medium"
            >
              <UserCircle className="h-5 w-5" />
              <span className="hidden sm:inline">Login</span>
            </NavLink>
            
            <NavLink
              to="/store"
              className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors"
              activeClassName="text-primary font-medium"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">Store</span>
            </NavLink>
            
            <NavLink
              to="/admin"
              className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors"
              activeClassName="text-primary font-medium"
            >
              <Shield className="h-5 w-5" />
              <span className="hidden sm:inline">Admin</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
