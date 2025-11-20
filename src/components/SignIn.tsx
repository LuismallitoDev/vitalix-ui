import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";


interface SignInProps {
    isActive: boolean;
    setIsActive: (isActive: boolean) => void;
    handleGoogleAuth: () => void;
    loginEmail: string;
    setLoginEmail: (value: string) => void;
    loginPassword: string;
    setLoginPassword: (value: string) => void;
    handleLogin: (e: React.FormEvent) => void;
    error: boolean;
    loading: boolean | null;
}

const SignIn: React.FC<SignInProps> = ({
    isActive,
    setIsActive,
    handleGoogleAuth,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    handleLogin,
    error,
    loading
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const validateAndSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(loginEmail)) {
            setValidationError("Please enter a valid email address.");
            return;
        }

        handleLogin(e);
    };
    return (
        <div
            className={`absolute top-0 h-full transition-all duration-300 ease-in-out left-0 
        w-full md:w-1/2 z-[2] 
        ${isActive
                    ? 'opacity-0 z-0 md:translate-x-full'
                    : 'opacity-100 z-20'
                }`}
        >
            <form
                className="bg-white flex items-center justify-center flex-col px-8 md:px-10 h-full text-center"
                onSubmit={handleLogin}
            >
                <div className="mb-4 flex items-center gap-2 text-slate-700 font-bold text-xl">
                    <img src="src\assests\isologo.jpg" className="w-6 h-10" alt="Vitalix Plus Isologo" />
                    Vitalix Plus
                </div>

                <h1 className="text-3xl font-bold mb-4 text-slate-800">Iniciar Sesión</h1>

                {/* GOOGLE BUTTON WITH SVG */}
                <div className="w-full my-3">
                    <button
                        type="button"
                        onClick={handleGoogleAuth}
                        className="flex items-center justify-center gap-2 w-full bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 font-medium text-sm py-2.5 px-4 rounded-lg transition-all duration-200 shadow-sm"
                    >
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google Logo"
                            className="w-5 h-5"
                            loading="lazy"
                        />
                        <span>Iniciar Sesión con Google</span>
                    </button>
                </div>

                <span className="text-xs mb-2 text-slate-500">
                    o utiliza tu email y contraseña
                </span>

                <input
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="bg-sky-50 border border-transparent focus:border-green-400 my-2 py-2.5 px-4 text-[13px] rounded-lg w-full outline-none transition-colors"
                />
                {/* Password Field with Toggle */}
                <div className="relative w-full">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Contraseña"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="bg-sky-50 border border-transparent focus:border-green-400 my-2 py-2.5 px-4 text-[13px] rounded-lg w-full outline-none transition-colors"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>

                {/* Error Message Display */}
                {(validationError || error) && (
                    <div className="w-full bg-red-50 text-red-500 text-xs py-2 px-3 rounded mt-2 border border-red-100 animate-in fade-in slide-in-from-top-1">
                        {validationError || error}
                    </div>
                )}

                <div className="w-full flex justify-between items-center mt-4 mb-4">
                    <Link to={"/reset-password"}><span className="text-slate-600 text-[13px] no-underline hover:text-green-600 transition-colors">¿Olvidaste tu Contraseña?</span></Link>
                </div>

                <button
                    disabled={loading}
                    onClick={validateAndSubmit}
                    className="bg-[#4fc3f7] active:bg-green-400 hover:bg-[#29b6f6] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs py-2.5 px-11 border border-transparent rounded-lg font-semibold uppercase cursor-pointer transition-colors shadow-md flex items-center gap-2"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? "Iniciando Sesión..." : "Iniciar Sesión"}
                </button>
                {/* MOBILE TOGGLE */}
                <div className="mt-6 block md:hidden">
                    <p className="text-xs text-slate-500">
                        ¿No tienes una cuenta? <br />
                        <span
                            onClick={() => setIsActive(true)}
                            className="text-[#4fc3f7] active:bg-green-400 font-bold cursor-pointer hover:underline mt-1 inline-block"
                        >
                            Registrate
                        </span>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default SignIn;