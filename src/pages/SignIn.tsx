import React from "react";
import { Link } from "react-router-dom";

interface SignInProps {
    isActive: boolean;
    setIsActive: (isActive: boolean) => void;
    handleGoogleAuth: () => void;
    loginEmail: string;
    setLoginEmail: (value: string) => void;
    loginPassword: string;
    setLoginPassword: (value: string) => void;
    handleLogin: (e: React.FormEvent) => void;
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
}) => {
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
                    <i className="fa-solid fa-capsules text-[#66bb6a]"></i> Vitalix Plus
                </div>

                <h1 className="text-3xl font-bold mb-4 text-slate-800">Sign In</h1>

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
                        <span>Sign in with Google</span>
                    </button>
                </div>

                <span className="text-xs mb-2 text-slate-500">
                    or use your email password
                </span>

                <input
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="bg-sky-50 border border-transparent focus:border-green-400 my-2 py-2.5 px-4 text-[13px] rounded-lg w-full outline-none transition-colors"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="bg-sky-50 border border-transparent focus:border-green-400 my-2 py-2.5 px-4 text-[13px] rounded-lg w-full outline-none transition-colors"
                />

                <div className="w-full flex justify-between items-center mt-4 mb-4 text-center">
                    <Link
                        to={"/reset-password"}
                        className="text-slate-600 text-[13px] no-underline hover:text-green-600 transition-colors "
                    >
                        Forget Your Password?
                    </Link>
                </div>

                <button className="bg-[#4fc3f7] hover:bg-[#29b6f6] text-white text-xs py-2.5 px-11 border border-transparent rounded-lg font-semibold uppercase cursor-pointer transition-colors shadow-md">
                    Sign In
                </button>

                {/* MOBILE TOGGLE */}
                <div className="mt-6 block md:hidden">
                    <p className="text-xs text-slate-500">
                        Don't have an account? <br />
                        <span
                            onClick={() => setIsActive(true)}
                            className="text-[#4fc3f7] font-bold cursor-pointer hover:underline mt-1 inline-block"
                        >
                            Sign Up
                        </span>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default SignIn;