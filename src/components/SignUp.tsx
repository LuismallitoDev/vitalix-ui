import React, { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";

interface SignUpProps {
    isActive: boolean;
    setIsActive: (isActive: boolean) => void;
    handleGoogleAuth: () => void;
    registerName: string;
    setRegisterName: (value: string) => void;
    registerEmail: string;
    setRegisterEmail: (value: string) => void;
    registerPassword: string;
    setRegisterPassword: (value: string) => void;
    registerAddress: string;
    setRegisterAddress: (value: string) => void;
    handleRegister: (e: React.FormEvent) => void;
    loading: boolean;
    error: string | null;
}

const SignUp: React.FC<SignUpProps> = ({
    isActive,
    setIsActive,
    handleGoogleAuth,
    registerName,
    setRegisterName,
    registerEmail,
    setRegisterEmail,
    registerPassword,
    setRegisterPassword,
    registerAddress,
    setRegisterAddress,
    handleRegister,
    loading,
    error
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const validateAndSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        // 1. Name Validation
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(registerName)) {
            setValidationError("Los nombres solo pueden tener letras.");
            return;
        }

        // 2. Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(registerEmail)) {
            setValidationError("Por favor, ingrese un correo válido.");
            return;
        }

        // 3. Password Length
        if (registerPassword.length < 6) {
            setValidationError("La contraseña debe tener mínimo 6 caracteres.");
            return;
        }

        // 4. Address Validation
        if (!registerAddress || registerAddress.length < 5) {
            setValidationError("Ingrese una dirección válida (mínimo 5 caracteres).");
            return;
        }

        // If all valid, proceed
        handleRegister(e);
    };

    return (
        <div className={`absolute top-0 h-full transition-all duration-300 ease-in-out left-0 
          w-full md:w-1/2 
          ${isActive
                ? 'opacity-100 z-20 md:translate-x-full md:z-[5] md:animate-fast-move'
                : 'opacity-0 z-0 md:opacity-0 md:z-[1]'
            }`}>

            <form className="bg-white flex items-center justify-center flex-col px-8 md:px-10 h-full text-center" onSubmit={validateAndSubmit}>
                <h1 className="text-3xl font-bold mb-4 text-slate-800">Crea una Cuenta</h1>

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
                        <span>Registrarse con Google</span>
                    </button>
                </div>

                <span className="text-xs mb-2 text-slate-500">o utiliza tu email</span>

                <input
                    type="text"
                    placeholder="Nombre Completo"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                    className="bg-slate-50 border border-transparent focus:border-green-400 my-2 py-2.5 px-4 text-[13px] rounded-lg w-full outline-none transition-colors"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    className="bg-slate-50 border border-transparent focus:border-green-400 my-2 py-2.5 px-4 text-[13px] rounded-lg w-full outline-none transition-colors"
                />

                <div className="relative w-full">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Contraseña"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                        className="bg-slate-50 border border-transparent focus:border-green-400 my-2 py-2.5 px-4 text-[13px] rounded-lg w-full outline-none transition-colors"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>

                {/* ADDRESS FIELD */}
                <input
                    type="text"
                    value={registerAddress}
                    onChange={(e) => setRegisterAddress(e.target.value)}
                    placeholder="Dirección (Ej: Calle 123 # 45-67)"
                    required
                    className="bg-slate-50 border border-transparent focus:border-green-400 my-2 py-2.5 px-4 text-[13px] rounded-lg w-full outline-none transition-colors"
                />

                {(validationError || error) && (
                    <div className="w-full bg-red-50 text-red-500 text-xs py-2 px-3 rounded mt-2 border border-red-100 animate-in fade-in slide-in-from-top-1">
                        {validationError || error}
                    </div>
                )}

                <button
                    disabled={loading}
                    type="submit"
                    className="bg-[#4fc3f7] hover:bg-[#29b6f6] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs py-2.5 px-11 border border-transparent rounded-lg font-semibold uppercase mt-4 cursor-pointer transition-colors shadow-md flex items-center gap-2"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? "Creando..." : "Registrarse"}
                </button>

                <div className="mt-6 block md:hidden">
                    <p className="text-xs text-slate-500">
                        ¿Ya tienes una cuenta? <br />
                        <span onClick={() => setIsActive(false)} className="text-[#4fc3f7] font-bold cursor-pointer hover:underline mt-1 inline-block">Inicia Sesión</span>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default SignUp;