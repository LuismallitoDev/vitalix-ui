import React from "react";

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
    handleRegister: (e: React.FormEvent) => void;
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
    handleRegister
}) => {
    return (
        <div className={`absolute top-0 h-full transition-all duration-300 ease-in-out left-0 
          w-full md:w-1/2 
          ${isActive
                ? 'opacity-100 z-20 md:translate-x-full md:z-[5] md:animate-fast-move'
                : 'opacity-0 z-0 md:opacity-0 md:z-[1]'
            }`}>

            <form className="bg-white flex items-center justify-center flex-col px-8 md:px-10 h-full text-center" onSubmit={handleRegister}>
                <h1 className="text-3xl font-bold mb-4 text-slate-800">Create Account</h1>

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
                        <span>Sign up with Google</span>
                    </button>
                </div>

                <span className="text-xs mb-2 text-slate-500">or use your email for registration</span>

                <input
                    type="text"
                    placeholder="Name"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                    className="bg-sky-50 border border-transparent focus:border-green-400 my-2 py-2.5 px-4 text-[13px] rounded-lg w-full outline-none transition-colors"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    className="bg-sky-50 border border-transparent focus:border-green-400 my-2 py-2.5 px-4 text-[13px] rounded-lg w-full outline-none transition-colors"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    className="bg-sky-50 border border-transparent focus:border-green-400 my-2 py-2.5 px-4 text-[13px] rounded-lg w-full outline-none transition-colors"
                />

                <button className="bg-[#4fc3f7] hover:bg-[#29b6f6] text-white text-xs py-2.5 px-11 border border-transparent rounded-lg font-semibold uppercase mt-4 cursor-pointer transition-colors shadow-md">
                    Sign Up
                </button>

                {/* MOBILE TOGGLE */}
                <div className="mt-6 block md:hidden">
                    <p className="text-xs text-slate-500">
                        Already have an account? <br />
                        <span onClick={() => setIsActive(false)} className="text-[#4fc3f7] font-bold cursor-pointer hover:underline mt-1 inline-block">Sign In</span>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default SignUp;