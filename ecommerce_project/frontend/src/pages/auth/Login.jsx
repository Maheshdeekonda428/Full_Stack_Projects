import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '', // Renamed from email to help browsers
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [silentLoginActive, setSilentLoginActive] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const { login, googleLogin, updateUser, storeCredentials } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();


    const from = location.state?.from?.pathname || '/';

    const handleFocus = () => {
        setIsUnlocked(true);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        console.log('--- Login Attempt Start ---');
        // Map username back to email for the login service
        const loginData = { email: formData.username, password: formData.password };
        console.log('Login data:', { ...loginData, password: '***' });

        try {
            const result = await login(loginData, silentLoginActive);
            console.log('Login result:', result);

            if (result.success) {
                // Save email if remember me is checked
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', formData.username);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                // Explicitly prompt to save credentials (NON-BLOCKING but AWAITED for UI consistency)
                if (!silentLoginActive) {
                    console.log('Triggering credential storage...');
                    await storeCredentials(formData.username, formData.password);
                }

                // If it's a silent login for a new Google user, we navigate immediately.
                if (silentLoginActive) {
                    console.log('Silent login successful. Navigating...');
                }

                console.log('Navigating to:', from);
                navigate(from, { replace: true });
            } else {
                console.log('Login failed:', result.error);
            }
        } catch (err) {
            console.error('Fatal error in handleSubmit:', err);
        } finally {
            console.log('--- Login Attempt End ---');
            setIsSubmitting(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsSubmitting(true);
        try {
            console.log('Google login success result:', credentialResponse);
            const result = await googleLogin(credentialResponse.credential);
            console.log('Backend authentication result:', result);

            if (result.success) {
                if (result.generated_password) {
                    console.log('New user detected! Triggering automated silent login for password save...');
                    setSilentLoginActive(true);
                    setFormData({
                        username: result.user.email,
                        password: result.generated_password
                    });
                    setIsUnlocked(true);
                    // setShowPassword(true); // Removed as per user request: "dont show pass word"

                    // Minimal delay to ensure React has rendered the data into the DOM
                    setTimeout(async () => {
                        const emailInput = document.getElementById('username');
                        const passwordInput = document.getElementById('password');
                        const submitBtn = document.querySelector('button[type="submit"]');

                        if (emailInput && passwordInput && submitBtn) {
                            console.log('Finalizing automated save...');

                            // Force events for browser detection
                            emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                            passwordInput.dispatchEvent(new Event('input', { bubbles: true }));

                            // Enable the button so the click is valid
                            setIsSubmitting(false);

                            // Trigger save and wait for it
                            console.log('Storing credentials for automated save...');
                            await storeCredentials(result.user.email, result.generated_password, result.user.name);

                            // Immediate-ish click (small delay for re-render)
                            setTimeout(() => {
                                if (submitBtn.disabled) submitBtn.disabled = false;
                                console.log('Programmatically clicking submit button...');
                                submitBtn.click();
                            }, 100);
                        } else {
                            console.log('Automated submission elements missing, navigating normally.');
                            navigate(from, { replace: true });
                        }
                    }, 300); // Fast delay
                } else {
                    console.log('Existing user, navigating to destination.');
                    navigate(from, { replace: true });
                }
            }
        } catch (error) {
            console.error('Error in handleGoogleSuccess:', error);
            toast.error('Google login failed. Please try again.');
        } finally {
            // We don't setIsSubmitting(false) if silent login is active, 
            // as the form submission will handle the navigation/state
            if (!silentLoginActive) {
                setIsSubmitting(false);
            }
        }
    };

    const handleGoogleError = () => {
        setIsSubmitting(false);
    };



    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50/50 backdrop-blur-sm">
            <div className="w-full max-w-lg">
                <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl shadow-2xl p-10 animate-fade-in-up">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200 animate-bounce-slow">
                            <span className="text-white font-bold text-3xl">S</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h1>
                        <p className="text-gray-500 mt-3 text-lg leading-relaxed">
                            {silentLoginActive ? 'Finishing secure sign-in...' : 'Sign in to sync your wishlist and cart.'}
                        </p>
                    </div>

                    {/* Form */}
                    <form
                        id="login-form"
                        name="login"
                        method="POST"
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 ml-1" htmlFor="username">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    onFocus={handleFocus}
                                    required
                                    autoComplete="username"
                                    className="input-field pl-11 py-3.5 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 placeholder:text-gray-400"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 ml-1" htmlFor="password">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={handleFocus}
                                    required
                                    autoComplete="current-password"
                                    className="input-field pl-11 pr-12 py-3.5 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 placeholder:text-gray-400"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.643-9.943-6.442a5.08 5.08 0 011.637-2.09l.487-.333m4.897-4.897L5.27 4.146a9.141 9.141 0 001.036 1.036M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 3.442C21.82 15.013 22.347 14.39 23 13.5c-1.675-3.799-5.465-6.442-9.943-6.442a9.96 9.96 0 00-1.07.059M7 7l10 10" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 transition-all cursor-pointer"
                                />
                                <span className="ml-2 text-sm text-gray-500 group-hover:text-gray-700 transition-colors font-medium">Remember me</span>
                            </label>
                            <Link to="/forgot-password" size="sm" className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 transform active:scale-[0.98] transition-all w-full flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader size="sm" /> : <span>Secure Login</span>}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-10">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-6 bg-white/80 text-gray-400 font-bold uppercase tracking-widest text-[10px]">or</span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <div className="flex justify-center transition-all hover:scale-[1.01] active:scale-[0.99]">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            useOneTap
                            theme="outline"
                            size="large"
                            text="continue_with"
                            shape="pill"
                            width="100%"
                        />
                    </div>

                    {/* Register Link */}
                    <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                        <p className="text-gray-500 font-medium text-sm">
                            New to ShopSmart?{' '}
                            <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 border-b-2 border-transparent hover:border-blue-600 transition-all ml-1">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
