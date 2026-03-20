import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const user = useAuthStore.getState().user;
      if (user?.role) {
        navigate(`/app/${user.role}`);
      } else {
        navigate("/app/admin"); // Fallback
      }
    }
    return () => clearError();
  }, [isAuthenticated, navigate, clearError]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(formData);
    if (success) {
      const user = useAuthStore.getState().user;
      if (user?.role) {
        navigate(`/app/${user.role}`);
      }
    }
  };

  return (
    <div className="bg-surface text-on-surface selection:bg-primary/20 selection:text-on-surface font-body overflow-hidden">
      <main className="min-h-screen flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Panel: Brand & Identity (Off-White Secondary Section) */}
        <section 
          className="hidden md:flex md:w-1/2 relative flex-col justify-center px-16 border-r border-[#D1C5B4]/30"
          style={{
            backgroundColor: "#F8F9FA",
            backgroundImage: "radial-gradient(at 0% 0%, rgba(197, 160, 89, 0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(34, 34, 34, 0.03) 0px, transparent 50%)"
          }}
        >
          <div 
            className="absolute inset-0 z-0" 
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C5A059' fill-opacity='0.03' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")"
            }}
          ></div>
          <div className="relative z-10 space-y-12">
            {/* Brand Anchor */}
            <div className="space-y-2">
              <h1 className="text-6xl font-medium tracking-tight text-on-surface font-serif">
                Patha Yatri
              </h1>
              <p className="text-sm text-primary font-semibold tracking-[0.3em] uppercase">
                Hotel Management System
              </p>
            </div>
            
            {/* Feature Highlights */}
            <div className="space-y-10 mt-12 max-w-md">
              <div className="flex items-start gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-primary border border-primary/20 bg-white group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>monitoring</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-on-surface font-serif mb-1">Real-time Tracking</h3>
                  <p className="text-on-surface-variant leading-relaxed text-sm">Monitor room occupancy, guest arrivals, and housekeeping status with refined precision.</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-primary border border-primary/20 bg-white group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>receipt_long</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-on-surface font-serif mb-1">GST-compliant Invoices</h3>
                  <p className="text-on-surface-variant leading-relaxed text-sm">Automated billing system designed for local compliance and effortless auditing.</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-primary border border-primary/20 bg-white group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>admin_panel_settings</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-on-surface font-serif mb-1">Role-based Access</h3>
                  <p className="text-on-surface-variant leading-relaxed text-sm">Secure multi-level permissions for admins, managers, and operational staff.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Tonal Decoration */}
          <div className="absolute bottom-12 left-16 right-16 flex items-center justify-between text-on-surface-variant/60 text-[10px] tracking-[0.2em] uppercase z-10">
            <span>Enterprise Suite v4.2</span>
            <span>Premium Hospitality Solutions</span>
          </div>
        </section>

        {/* Right Panel: Login Canvas (Pure White) */}
        <section className="flex-1 flex items-center justify-center bg-surface p-6 md:p-12 relative z-20">
          <div className="w-full max-w-md space-y-10">
            {/* Logo Area */}
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-surface-container border border-outline/20">
                <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>corporate_fare</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-medium text-on-surface font-serif">Welcome Back</h2>
                <p className="text-on-surface-variant tracking-tight text-sm">Enter your credentials to access the portal</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-none text-sm">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-5">
                {/* Email Input */}
                <div className="group">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-3 px-1" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant/40 group-focus-within:text-primary transition-colors">
                      <span className="material-symbols-outlined text-xl">mail</span>
                    </span>
                    <input 
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@pathayatri.com"
                      className="w-full pl-12 pr-4 py-4 bg-surface-container border border-outline/30 text-on-surface placeholder:text-on-surface-variant/40 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="group">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-3 px-1" htmlFor="password">
                    Security Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant/40 group-focus-within:text-primary transition-colors">
                      <span className="material-symbols-outlined text-xl">lock</span>
                    </span>
                    <input 
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-4 bg-surface-container border border-outline/30 text-on-surface placeholder:text-on-surface-variant/40 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-4 flex items-center text-on-surface-variant/40 hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 border border-outline/30 text-primary focus:ring-primary rounded-none bg-surface-container" />
                  <label htmlFor="remember-me" className="ml-3 block text-xs text-on-surface-variant">Remember me</label>
                </div>
                <button type="button" className="text-xs font-medium text-primary hover:text-on-surface transition-colors border-b border-primary/20">
                  Forgot password?
                </button>
              </div>

              {/* CTA Button */}
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-5 px-6 bg-on-surface text-surface font-semibold tracking-[0.15em] uppercase text-xs hover:bg-primary transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-on-surface hover:border-primary"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-surface border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Sign In
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials Helper */}
            <div className="pt-10 border-t border-outline/15">
              <p className="text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.25em] mb-8">
                Select Access Portal (Demo)
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  type="button"
                  onClick={() => setFormData({ email: "admin@hotel.com", password: "password123" })}
                  className="px-6 py-2.5 border border-outline/30 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:border-primary hover:text-primary transition-all duration-300 bg-surface-container"
                >
                  Admin
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({ email: "manager@hotel.com", password: "password123" })}
                  className="px-6 py-2.5 border border-outline/30 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:border-primary hover:text-primary transition-all duration-300 bg-surface-container"
                >
                  Manager
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({ email: "receptionist@hotel.com", password: "password123" })}
                  className="px-6 py-2.5 border border-outline/30 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:border-primary hover:text-primary transition-all duration-300 bg-surface-container"
                >
                  Reception
                </button>
              </div>
            </div>

            {/* Footer Text */}
            <p className="text-center text-xs text-on-surface-variant">
              Don't have access? <button type="button" className="text-on-surface font-semibold border-b border-on-surface/20 hover:text-primary hover:border-primary transition-all ml-1">Contact System Administrator</button>
            </p>
          </div>
        </section>

        {/* Visual Polish: Sophisticated Accents */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-on-surface/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
      </main>
    </div>
  );
};

export default Login;