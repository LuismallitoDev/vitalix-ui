import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import SignUp from "@/components/SignUp";
import SignIn from "@/components/SignIn";
import { useGlobalContext } from "../hooks/useGlobalContext";
import Footer from "./Footer";

const Login = () => {
  // Access Global Context functions
  const { login, register, user, authLoading } = useGlobalContext();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // --- LOCAL UI STATE ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleToggle = (status: boolean) => {
    setIsActive(status);
    setError(null);
  };

  // --- HANDLERS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const success = await login(loginEmail, loginPassword);

    if (!success) {
      // Error is handled via Toast in context, but we can set local error state too if we want to show it inline
      setError("Invalid credentials");
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const success = await register(registerName, registerEmail, registerPassword);

    if (!success) {
      setError("Registration failed");
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    // Since we are LocalStorage only, we can just mock this or disable it
    alert("Registrarse o Iniciar Sesión no estan disponibles en el modo LocalStorage.");
  };

  return (
    <>
      <style>
        {`
          @keyframes move {
            0%, 49.99% { opacity: 0; z-index: 1; }
            50%, 100% { opacity: 1; z-index: 5; }
          }
          @media (min-width: 768px) {
            .animate-fast-move { animation: move 0.3s; }
          }
            
          @media (max-width: 768px) {
            .marginBox {margin-top: 40px}
          }
        `}
      </style>

      <div className="min-h-screen marginBox mt-0 bg-[#f0f4f8] font-['Montserrat',sans-serif] text-slate-700 flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center py-12 px-4">
          <div className={`bg-white z-10 rounded-[30px] shadow-[0_5px_15px_rgba(0,0,0,0.1)] relative overflow-hidden w-full max-w-[400px] min-h-[550px] md:max-w-full md:w-[768px] md:min-h-[480px] transition-all duration-300 ${isActive ? 'active' : ''}`}>

            <SignUp
              isActive={isActive}
              setIsActive={handleToggle}
              handleGoogleAuth={handleGoogleAuth}
              registerName={registerName}
              setRegisterName={setRegisterName}
              registerEmail={registerEmail}
              setRegisterEmail={setRegisterEmail}
              registerPassword={registerPassword}
              setRegisterPassword={setRegisterPassword}
              handleRegister={handleRegister}
              loading={false}
              error={false}
            />

            <SignIn
              isActive={isActive}
              setIsActive={handleToggle}
              handleGoogleAuth={handleGoogleAuth}
              loginEmail={loginEmail}
              setLoginEmail={setLoginEmail}
              loginPassword={loginPassword}
              setLoginPassword={setLoginPassword}
              handleLogin={handleLogin}
              loading={false}
              error={false}
            />

            {/* Toggle Overlay */}
            <div className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-300 ease-in-out z-[1000] ${isActive ? '-translate-x-full rounded-[0_150px_100px_0]' : 'rounded-[150px_0_0_100px]'}`}>
              <div className={`bg-gradient-to-r from-[#81c784] to-[#43a047] text-white relative -left-full h-full w-[200%] transition-all duration-300 ease-in-out ${isActive ? 'translate-x-1/2' : 'translate-x-0'}`}>
                <div className={`absolute w-1/2 h-full flex items-center justify-center flex-col px-8 text-center top-0 transition-all duration-300 ease-in-out transform ${isActive ? 'translate-x-0' : '-translate-x-[200%]'}`}>
                  <h1 className="text-3xl font-bold mb-4">Bienvenido!</h1>
                  <p className="text-[14px] leading-5 tracking-wide my-5">Ingresa tus detalles para acceder a una experiencia personalizada.</p>
                  <button className="bg-transparent border border-white text-white text-xs py-2.5 px-11 rounded-lg font-semibold uppercase cursor-pointer hover:bg-white hover:text-[#43a047] transition-colors" onClick={() => handleToggle(false)}>Iniciar Sesión</button>
                </div>
                <div className={`absolute right-0 w-1/2 h-full flex items-center justify-center flex-col px-8 text-center top-0 transition-all duration-300 ease-in-out transform ${isActive ? 'translate-x-[200%]' : 'translate-x-0'}`}>
                  <h1 className="text-3xl font-bold mb-4">Hola, Amigo!</h1>
                  <p className="text-[14px] leading-5 tracking-wide my-5">Registrate con tus datos para acceder a una experiencia personalizada.</p>
                  <button className="bg-transparent border border-white text-white text-xs py-2.5 px-11 rounded-lg font-semibold uppercase cursor-pointer hover:bg-white hover:text-[#43a047] transition-colors" onClick={() => handleToggle(true)}>Registrarse</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />

    </>
  );
};

export default Login;