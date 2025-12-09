import {
    Pill,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Mail,
    Phone,
    ArrowRight
} from "lucide-react";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-slate-200 pt-16 pb-8 font-['Montserrat',sans-serif] text-slate-600">
            <div className="container mx-auto px-4">

                {/* --- TOP SECTION (Grid) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Column 1: Brand Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <img src="src\assests\isologo.jpg" className="w-10 h-14" alt="Vitalix Plus Isologo" />
                            <span className="text-2xl font-bold text-slate-800">Vitalix Plus</span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-500">

                            En la Droguería VITALIX PLUS nuestras actividades se basan en la comercialización de productos farmacéuticos de calidad, orientados a sus clientes y a brindar beneficios a sus clientes y usuarios, integrando una atención eficiente, eficaz y efectiva.
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                                <a
                                    key={index}
                                    href="https://www.instagram.com/drogueriavitalixplus_medellin/"
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-[#4fc3f7] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Quick Links (Shop) */}
                    <div>
                        <h3 className="text-slate-800 font-bold text-lg mb-6">Tienda</h3>
                        <ul className="space-y-4 text-sm">
                            <li><a href="#" className="hover:text-[#4fc3f7] hover:translate-x-1 inline-block transition-all duration-200">Medicamentos</a></li>
                            <li><a href="#" className="hover:text-[#4fc3f7] hover:translate-x-1 inline-block transition-all duration-200">Cuidado Personal</a></li>
                            <li><a href="#" className="hover:text-[#4fc3f7] hover:translate-x-1 inline-block transition-all duration-200">Vitaminas y Suplementos</a></li>
                            <li><a href="#" className="hover:text-[#4fc3f7] hover:translate-x-1 inline-block transition-all duration-200">Equipo Médico</a></li>
                            <li><a href="#" className="hover:text-[#4fc3f7] hover:translate-x-1 inline-block transition-all duration-200">Belleza y Piel</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Support */}
                    <div>
                        <h3 className="text-slate-800 font-bold text-lg mb-6">Soporte</h3>
                        <ul className="space-y-4 text-sm">
                            <li><a href="#" className="hover:text-[#4fc3f7] hover:translate-x-1 inline-block transition-all duration-200">Centro de Ayuda</a></li>
                            <li><a href="#" className="hover:text-[#4fc3f7] hover:translate-x-1 inline-block transition-all duration-200">Localiza tu Pedido</a></li>
                            <li><a href="#" className="hover:text-[#4fc3f7] hover:translate-x-1 inline-block transition-all duration-200">Reembolsos</a></li>
                            <li><a href="#" className="hover:text-[#4fc3f7] hover:translate-x-1 inline-block transition-all duration-200">Politica de Envios</a></li>
                            <li className="flex items-center gap-2 pt-2 text-slate-800 font-semibold">
                                <Phone size={16} className="text-[#66bb6a]" />
                                <span>+57 (323) 335-3753</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div>
                        <h3 className="text-slate-800 font-bold text-lg mb-6">Mantente Saludable</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Suscríbete para recibir ofertas especiales, regalos y consejos de salud.
                        </p>
                        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    placeholder="Tu correo electrónico"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#4fc3f7] focus:ring-1 focus:ring-[#4fc3f7] transition-all"
                                />
                            </div>
                            <button className="w-full bg-[#4fc3f7] hover:bg-[#29b6f6] text-white text-sm font-semibold py-3 px-4 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 group">
                                Suscribirse
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* --- BOTTOM BAR --- */}
                <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>&copy; {currentYear} Vitalix Plus. Todos los derechos reservados.</p>

                    <div className="flex items-center gap-6">
                        <a href="#" className="hover:text-[#4fc3f7] transition-colors">Politica de Privacidad</a>
                        <a href="#" className="hover:text-[#4fc3f7] transition-colors">Terminos y Condiciones</a>
                        <a href="#" className="hover:text-[#4fc3f7] transition-colors">Politicas de Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;