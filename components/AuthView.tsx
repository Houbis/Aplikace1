import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ShieldCheck, Fingerprint, Lock, User as UserIcon, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // State for animation
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);

  useEffect(() => {
    if (window.PublicKeyCredential) {
      setBiometricsAvailable(true);
    }
  }, []);

  const performLoginSuccess = (userToLogin: User) => {
      setIsLoading(false);
      setIsSuccess(true);
      
      // Play animation for 2 seconds then actually login
      setTimeout(() => {
          onLogin(userToLogin);
      }, 2000);
  };

  const handleBiometricLogin = async () => {
    setIsLoading(true);
    setTimeout(() => {
        performLoginSuccess({
            username: 'jan.poradce',
            fullName: 'Jan Poradce',
            biometricsEnabled: true
        });
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
        if (mode === 'REGISTER') {
            performLoginSuccess({
                username,
                fullName,
                biometricsEnabled: true
            });
        } else {
            performLoginSuccess({
                username,
                fullName: 'Jan Poradce',
                biometricsEnabled: true
            });
        }
    }, 1000);
  };

  // Success Animation View
  if (isSuccess) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors duration-300">
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl p-10 flex flex-col items-center justify-center animate-in zoom-in duration-300 border border-gray-100 dark:border-slate-700">
                {/* Google Pay Style Pulse Animation */}
                <div className="relative flex items-center justify-center mb-6">
                    <div className="absolute w-24 h-24 bg-green-500 rounded-full opacity-20 animate-ping"></div>
                    <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40">
                         {/* Drawing Checkmark SVG */}
                         <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                d="M5 13l4 4L19 7" 
                                className="animate-[dash_0.6s_ease-in-out_forwards]"
                                style={{ strokeDasharray: 24, strokeDashoffset: 24, animationDelay: '0.2s' }}
                            />
                            <style>{`
                                @keyframes dash {
                                    to { stroke-dashoffset: 0; }
                                }
                            `}</style>
                        </svg>
                    </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 animate-in slide-in-from-bottom fade-in duration-500 delay-300">
                    Úspěšně přihlášeno
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm animate-in slide-in-from-bottom fade-in duration-500 delay-500">
                    Načítám vaše portfolio...
                </p>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      
      {/* Brand Header */}
      <div className="mb-8 text-center animate-in slide-in-from-top duration-500">
         <div className="w-16 h-16 bg-[#007dc5] rounded-full flex items-center justify-center text-white shadow-lg mx-auto mb-4">
            <ShieldCheck size={32} />
        </div>
        <h1 className="text-3xl font-bold text-[#007dc5] dark:text-blue-400 tracking-tight">ČSOB Poradce</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Váš inteligentní asistent</p>
      </div>

      {/* Auth Card */}
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700 animate-in zoom-in-95 duration-300">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-slate-700">
            <button 
                onClick={() => setMode('LOGIN')}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${mode === 'LOGIN' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-slate-700 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
            >
                Přihlášení
            </button>
            <button 
                onClick={() => setMode('REGISTER')}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${mode === 'REGISTER' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-slate-700 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
            >
                Registrace
            </button>
        </div>

        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
                
                {mode === 'REGISTER' && (
                    <div className="space-y-1 animate-in slide-in-from-left">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Celé jméno</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white transition-all"
                                placeholder="Jan Novák"
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Uživatelské jméno</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white transition-all"
                            placeholder="jan.novak"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Heslo</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white transition-all"
                            placeholder="••••••••"
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-200 dark:shadow-none"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            {mode === 'LOGIN' ? 'Přihlásit se' : 'Vytvořit účet'}
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>

            {mode === 'LOGIN' && biometricsAvailable && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700 text-center">
                    <p className="text-xs text-gray-400 mb-3">Nebo použijte biometrii</p>
                    <button 
                        onClick={handleBiometricLogin}
                        className="p-4 bg-gray-50 dark:bg-slate-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-gray-200 dark:border-slate-600"
                        title="Přihlásit otiskem prstu / FaceID"
                    >
                        <Fingerprint size={32} />
                    </button>
                </div>
            )}
        </div>
        
        <div className="bg-gray-50 dark:bg-slate-700/50 p-4 text-center text-xs text-gray-500 dark:text-gray-400">
             © 2024 ČSOB Finanční Poradce v1.2
        </div>
      </div>
    </div>
  );
};