import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [strength, setStrength] = useState(0);
    const [passwordMatch, setPasswordMatch] = useState(null); // null, true, false

    const calculateStrength = (pass) => {
        let score = 0;
        if (pass.length > 5) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        setStrength(score);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'password') {
            calculateStrength(value);
            if (formData.confirmPassword) {
                setPasswordMatch(value === formData.confirmPassword);
            }
        }

        if (name === 'confirmPassword') {
            setPasswordMatch(value === formData.password);
        }
    };

    const strengthLabel = ['Very Weak', 'Weak', 'Good', 'Strong', 'Excellent'][strength];
    const strengthColor = ['bg-gray-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'][strength];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords don't match");
        }
        if (strength < 1) {
            return toast.error("Please choose a stronger password");
        }

        setIsSubmitting(true);

        try {
            const response = await api.post('/auth/reset-password', {
                token,
                new_password: formData.password
            });
            toast.success(response.data.message);
            navigate('/login');
        } catch (error) {
            // Error handling managed by interceptor
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50/50 backdrop-blur-sm">
            <div className="w-full max-w-lg">
                <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl shadow-2xl p-10 animate-fade-in-up">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-tr from-green-600 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Protect Account</h1>
                        <p className="text-gray-500 mt-3 text-lg leading-relaxed">Choose a strong password to secure your account.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 ml-1">
                                New Password
                            </label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="input-field py-3.5 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 pr-12"
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

                            {/* Strength Meter */}
                            <div className="pt-1">
                                <div className="flex justify-between items-center mb-1 ml-1">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Complexity</span>
                                    <span className={`text-xs font-bold uppercase ${strength > 2 ? 'text-green-600' : 'text-gray-500'}`}>{strengthLabel}</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                                    {[1, 2, 3, 4].map((step) => (
                                        <div key={step} className={`h-full flex-1 transition-all duration-500 ${strength >= step ? strengthColor : 'bg-gray-200'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 ml-1">
                                Verify Password
                            </label>
                            <div className="relative group">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className={`input-field py-3.5 rounded-2xl border-gray-200 focus:ring-4 transition-all text-gray-900 ${passwordMatch === true ? 'border-green-500 focus:border-green-500 focus:ring-green-500/10' :
                                        passwordMatch === false ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' :
                                            'focus:border-blue-500 focus:ring-blue-500/10'
                                        }`}
                                    placeholder="Repeat your password"
                                />
                                {passwordMatch !== null && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none animate-fade-in">
                                        {passwordMatch ? (
                                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-green-500/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group mt-4"
                        >
                            {isSubmitting ? <Loader size="sm" /> : 'Update Secure Password'}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                        <Link to="/login" className="inline-flex items-center gap-2 text-gray-500 font-medium hover:text-blue-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Cancel and Return
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
