import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/10 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full bg-secondary/30" />

        <div className="text-center z-10 space-y-6">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-white/20 flex items-center justify-center text-white font-black text-4xl cartoon-shadow">
            CA
          </div>
          <h1 className="text-4xl font-black text-white">Course Antik</h1>
          <p className="text-white/70 max-w-sm text-lg">
            Learn cartoon art, shop exclusive merch, and level up your
            creativity! 🎨✨
          </p>
        </div>
      </div>

      {/* Right: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        {/* Mobile brand */}
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center text-white font-black text-2xl cartoon-shadow-sm mb-4">
              CA
            </div>
            <h1 className="text-2xl font-black text-gradient">Course Antik</h1>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
