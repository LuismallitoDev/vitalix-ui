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
                            <img src="src\assests\isologo.jpg" className="w-12 h-14" alt="Vitalix Plus Isologo" />
                            <span className="text-2xl font-bold text-slate-800">Vitalix Plus</span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-500">
                            Empowering your health journey with trusted pharmaceutical products and wellness solutions. Quality you can rely on, care you can feel.
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-[#4fc3f7] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Quick Links (Shop) */}
                    <div>
                        <h3 className="text-slate-800 font-bold text-lg mb-6">Shop</h3>
                        <ul className="space-y-4 text-sm">
                            <li><a href="#" className="hover:text-[#4fc3f7] hover:translate-x-1 inline-block transition-all duration-200">Medicines</a></li>
                            <li><a href="#" className="hover:text-[#4fc3f7] hover:translate-x-1 inline-block transition-all duration-200">Personal Care</a></li>
                            <li><a href="#" className="hover:text-[#4fc3f7] hover:translate-x-1 inline-block transition-all duration-200">Vitamins & Supplements</a></li>
                            <li><a href="#" className="hover:text-[#4fc3f7] hover:translate-x-1 inline-block transition-all duration-200">Medical Equipment</a></li>
                            <li><a href="#" className="hover:text-[#4fc3f7] hover:translate-x-1 inline-block transition-all duration-200">Beauty & Skincare</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Support */}
                    <div>
                        <h3 className="text-slate-800 font-bold text-lg mb-6">Support</h3>
                        <ul className="space-y-4 text-sm">
                            <li><a href="#" className="hover:text-[#4fc3f7] hover:translate-x-1 inline-block transition-all duration-200">Help Center</a></li>
                            <li><a href="#" className="hover:text-[#4fc3f7] hover:translate-x-1 inline-block transition-all duration-200">Track Your Order</a></li>
                            <li><a href="#" className="hover:text-[#4fc3f7] hover:translate-x-1 inline-block transition-all duration-200">Returns & Refunds</a></li>
                            <li><a href="#" className="hover:text-[#4fc3f7] hover:translate-x-1 inline-block transition-all duration-200">Shipping Policy</a></li>
                            <li className="flex items-center gap-2 pt-2 text-slate-800 font-semibold">
                                <Phone size={16} className="text-[#66bb6a]" />
                                <span>+1 (800) 123-4567</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div>
                        <h3 className="text-slate-800 font-bold text-lg mb-6">Stay Healthy</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Subscribe to get special offers, free giveaways, and health tips.
                        </p>
                        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#4fc3f7] focus:ring-1 focus:ring-[#4fc3f7] transition-all"
                                />
                            </div>
                            <button className="w-full bg-[#4fc3f7] hover:bg-[#29b6f6] text-white text-sm font-semibold py-3 px-4 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 group">
                                Subscribe
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* --- BOTTOM BAR --- */}
                <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>&copy; {currentYear} Vitalix Plus. All rights reserved.</p>

                    <div className="flex items-center gap-6">
                        <a href="#" className="hover:text-[#4fc3f7] transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-[#4fc3f7] transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-[#4fc3f7] transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;