
import React, { useState } from 'react';
import { User as UserIcon, Lock as LockIconSvg, Eye as EyeIcon, EyeOff as EyeOffIcon } from 'lucide-react';
import { User } from '../../types';
import { login } from '../../services/auth';

interface LoginProps {
    onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const cleanEmail = email.trim();
        try {
            const user = await login(cleanEmail, password);
            await onLoginSuccess(user);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan jaringan atau server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page flex items-center justify-center min-h-screen bg-white p-4 relative overflow-hidden">
            <div className="w-full max-w-sm mx-auto relative z-10">
                <div className="login-card bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/50">
                    <div className="login-header text-center mb-8">
                        <div className="login-logo-wrap flex justify-center mb-6">
                            <img src="/assets/images/logos/light-logo.svg" alt="Attera Visual" width="160" height="40" decoding="async" className="h-10 w-auto"  loading="lazy" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800">Login</h1>
                        <p className="text-sm text-slate-500 mt-2">Hey, masukkan detail Anda untuk masuk ke akun Anda</p>
                    </div>

                    <form className="login-form space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="login-error p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        <div className="input-with-icon">
                            <UserIcon className="input-icon w-5 h-5" />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="username"
                                required
                                className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800"
                                placeholder="Enter your username/email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="input-with-icon">
                            <LockIconSvg className="input-icon w-5 h-5" />
                            <input
                                id="password"
                                name="password"
                                type={isPasswordVisible ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800"
                                style={{ paddingRight: '2.5rem' }}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                aria-label={isPasswordVisible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                            >
                                {isPasswordVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="button-primary w-full"
                            >
                                {isLoading ? 'Logging In...' : 'Log In'}
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                window.location.hash = '#/home';
                            }}
                            className="login-back text-xs text-slate-500 hover:text-blue-600 transition-colors"
                        >
                            &larr; Kembali ke Beranda
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                @media (max-width: 640px) {
                    #root .login-page {
                        padding-left: 12px !important;
                        padding-right: 12px !important;
                    }

                    #root .login-page .login-card {
                        box-sizing: border-box;
                        padding: 16px !important;
                        border-radius: 10px !important;
                    }

                    #root .login-page .login-header {
                        margin-bottom: 16px !important;
                    }

                    #root .login-page .login-logo-wrap {
                        margin-bottom: 14px !important;
                    }

                    #root .login-page .login-header h1 {
                        font-size: 22px !important;
                        line-height: 1.25 !important;
                    }

                    #root .login-page .login-header p {
                        font-size: 13px !important;
                        line-height: 1.45 !important;
                    }

                    #root .login-page .login-form > * + * {
                        margin-top: 8px !important;
                    }

                    #root .login-page .login-form .input-with-icon {
                        min-width: 0;
                    }

                    #root .login-page .login-form .input-with-icon input {
                        box-sizing: border-box;
                        width: 100%;
                        min-width: 0;
                        min-height: 40px !important;
                        height: 40px !important;
                        padding: 0 40px 0 36px !important;
                        font-size: 13px !important;
                        line-height: 1.25 !important;
                        border-radius: 8px !important;
                    }

                    #root .login-page .login-form .input-with-icon > button[type="button"] {
                        box-sizing: border-box;
                        width: 36px !important;
                        min-width: 36px !important;
                        min-height: 36px !important;
                        height: 36px !important;
                        max-height: none !important;
                        padding: 6px !important;
                    }

                    #root .login-page .login-error {
                        padding: 8px 10px !important;
                        font-size: 12px !important;
                        line-height: 1.35 !important;
                    }

                    #root .login-page .login-form button[type="submit"] {
                        box-sizing: border-box;
                        width: 100%;
                        min-height: 38px !important;
                        height: 38px !important;
                        max-height: none !important;
                        padding: 0 12px !important;
                        font-size: 13px !important;
                        line-height: 1.2 !important;
                        border-radius: 8px !important;
                    }

                    #root .login-page .login-back {
                        min-height: 32px !important;
                        max-height: none !important;
                        padding: 6px 8px !important;
                        font-size: 12px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;
