import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "./Footer";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError("Por favor, ingrese un correo válido.");
      return;
    }
    setIsSubmitted(true);
    setValidationError("")
  }


  return (
    <>
      <div className="min-h-screen bg-[#f0f4f8] font-['Montserrat',sans-serif] text-slate-700 flex flex-col">

        {/* --- NAVIGATION --- */}
        <Navigation />

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 flex items-center justify-center py-12 px-4">

          {/* CARD CONTAINER */}
          <div className="bg-white rounded-[30px] shadow-[0_5px_15px_rgba(0,0,0,0.1)] w-full max-w-[500px] p-10 text-center relative overflow-hidden">

            {/* DECORATIVE BACKGROUND ELEMENTS (Subtle Circles) */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-50 rounded-full opacity-50 pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-50 rounded-full opacity-50 pointer-events-none"></div>

            {!isSubmitted ? (
              /* --- FORM STATE --- */
              <div className="relative z-10 animate-fade-in">
                {/* Icon */}
                <div className="mx-auto w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mb-6">
                  <i className="fa-solid fa-key text-2xl text-[#4fc3f7]"></i>
                </div>

                <h1 className="text-3xl font-bold mb-3 text-slate-800">¿Olvidaste tu Contraseña?</h1>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                  ¡No te preocupes! Ingresa tu correo asociado a tu cuenta y te enviaremos un link para recuperarla.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="mb-6 text-left">
                    <label htmlFor="email" className="block text-xs font-bold text-slate-600 ml-1 mb-2 uppercase tracking-wide">
                      Correo Electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="nombre@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-sky-50 border border-slate-200 focus:border-green-400 focus:ring-1 focus:ring-green-200 py-3 px-4 text-sm rounded-lg outline-none transition-all duration-200 text-slate-700 placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="w-full bg-[#4fc3f7] hover:bg-[#29b6f6] text-white text-sm font-semibold py-3.5 px-4 rounded-lg uppercase tracking-wide shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Enviar el Link
                  </button>
                </form>
                {/* Error Message Display (Local Validation OR Server Error) */}
                {(validationError ) && (
                  <div className="w-full bg-red-50 text-red-500 text-xs py-2 px-3 rounded mt-2 border border-red-100 animate-in fade-in slide-in-from-top-1">
                    {validationError }
                  </div>
                )}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <a href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#66bb6a] transition-colors group">
                    <i className="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-1"></i>
                    Volver a Iniciar Sesión
                  </a>
                </div>
              </div>
            ) : (
              /* --- SUCCESS STATE --- */
              <div className="relative z-10 animate-fade-in">
                <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
                  <i className="fa-solid fa-envelope-circle-check text-3xl text-[#66bb6a]"></i>
                </div>

                <h1 className="text-3xl font-bold mb-3 text-slate-800">Revisa tu Correo</h1>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                  Te hemos enviando un link de recuperación a <br />
                  <span className="font-semibold text-slate-700">{email}</span>
                </p>

                <button
                  onClick={() => window.open('mailto:', '_blank')}
                  className="w-full bg-[#66bb6a] hover:bg-[#43a047] text-white text-sm font-semibold py-3.5 px-4 rounded-lg uppercase tracking-wide shadow-md hover:shadow-lg transition-all duration-300 mb-4"
                >
                  Abrir Correo
                </button>

                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full bg-transparent border border-slate-200 hover:bg-slate-50 text-slate-500 text-sm font-semibold py-3.5 px-4 rounded-lg transition-colors"
                >
                  Intentar Otro Correo
                </button>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <a href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#66bb6a] transition-colors group">
                    <i className="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-1"></i>
                    Volver a Iniciar Sesión
                  </a>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Simple fade animation style */}
        <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
      </div>
      <Footer />
    </>

  );
};

export default ForgotPassword;