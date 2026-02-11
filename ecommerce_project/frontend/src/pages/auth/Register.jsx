import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        username: '', // Renamed from email
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [strength, setStrength] = useState(0);
    const [passwordMatch, setPasswordMatch] = useState(null); // null, true, false

    const { register } = useAuth();
    const navigate = useNavigate();

    const calculateStrength = (pass) => {
        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        setStrength(score);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }

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

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.username) newErrors.username = 'Email is required';

        const password = formData.password;
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Min 8 characters required';
        } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
            newErrors.password = 'Must contain upper & lower case';
        } else if (!/[0-9]/.test(password)) {
            newErrors.password = 'Must contain at least one number';
        } else if (!/[^A-Za-z0-9]/.test(password)) {
            newErrors.password = 'Must contain a special character';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);

        const result = await register({
            name: formData.name,
            email: formData.username, // Map username back to email for API
            password: formData.password,
        });

        if (result.success) {
            navigate('/');
        }

        setIsSubmitting(false);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50/50 backdrop-blur-sm">
            <div className="w-full max-w-lg">
                <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl shadow-2xl p-10 animate-fade-in-up">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
                            <span className="text-white font-bold text-3xl">S</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h1>
                        <p className="text-gray-500 mt-3 text-lg">Join ShopSmart and start shopping</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700 ml-1" htmlFor="name">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                autoComplete="name"
                                className={`input-field rounded-2xl py-3 shadow-sm ${errors.name ? 'border-red-500 ring-red-500/10' : 'border-gray-200 focus:border-blue-500'}`}
                                placeholder="John Doe"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700 ml-1" htmlFor="username">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                autoComplete="username"
                                className={`input-field rounded-2xl py-3 shadow-sm ${errors.username ? 'border-red-500 ring-red-500/10' : 'border-gray-200 focus:border-blue-500'}`}
                                placeholder="you@example.com"
                            />
                            {errors.username && <p className="text-red-500 text-xs mt-1 ml-1">{errors.username}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700 ml-1" htmlFor="password">
                                Password
                            </label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    className={`input-field rounded-2xl py-3 pr-12 shadow-sm transition-all ${errors.password ? 'border-red-500 ring-red-500/10' : 'border-gray-200 focus:border-blue-500'}`}
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

                            {/* Strength Meter UI */}
                            {formData.password && (
                                <div className="pt-2">
                                    <div className="flex justify-between items-center mb-1.5 ml-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Strength</span>
                                        <span className={`text-[10px] font-bold uppercase ${strength > 2 ? 'text-green-600' : 'text-gray-500'}`}>{strengthLabel}</span>
                                    </div>
                                    <div className="h-1.2 w-full bg-gray-100 rounded-full overflow-hidden flex gap-1 mb-3">
                                        {[1, 2, 3, 4].map((step) => (
                                            <div key={step} className={`h-full flex-1 transition-all duration-500 ${strength >= step ? strengthColor : 'bg-gray-200'}`} />
                                        ))}
                                    </div>

                                    {/* Password Requirements List */}
                                    <div className="grid grid-cols-2 gap-y-1.5 ml-1 animate-fade-in-down">
                                        {[
                                            { label: '8+ Characters', met: formData.password.length >= 8 },
                                            { label: 'Upper & Lower', met: /[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) },
                                            { label: 'One Number', met: /[0-9]/.test(formData.password) },
                                            { label: 'Special Char', met: /[^A-Za-z0-9]/.test(formData.password) },
                                        ].map((req, i) => (
                                            <div key={i} className="flex items-center gap-1.5">
                                                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${req.met ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                    {req.met ? (
                                                        <svg className="w-2 h-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                                    )}
                                                </div>
                                                <span className={`text-[10px] font-medium transition-colors ${req.met ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {req.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700 ml-1" htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    className={`input-field rounded-2xl py-3 pr-12 shadow-sm transition-all ${passwordMatch === true ? 'border-green-500' :
                                        passwordMatch === false ? 'border-red-500' :
                                            'border-gray-200 focus:border-blue-500'
                                        }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-gray-400"
                                >
                                    {passwordMatch !== null ? (
                                        passwordMatch ? (
                                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        )
                                    ) : (
                                        showConfirmPassword ? (
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 text-gray-400 border-" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.643-9.943-6.442a5.08 5.08 0 011.637-2.09l.487-.333m4.897-4.897L5.27 4.146a9.141 9.141 0 001.036 1.036M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 3.442C21.82 15.013 22.347 14.39 23 13.5c-1.675-3.799-5.465-6.442-9.943-6.442a9.96 9.96 0 00-1.07.059M7 7l10 10" />
                                            </svg>
                                        )
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
                        </div>

                        <div className="flex items-start pt-2">
                            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 mt-1 cursor-pointer transition-all" required />
                            <span className="ml-2 text-xs text-gray-500 leading-relaxed">
                                By creating an account, you agree to our{' '}
                                <a href="#" className="text-blue-600 font-semibold hover:underline">Terms</a>
                                {' '}and{' '}
                                <a href="#" className="text-blue-600 font-semibold hover:underline">Privacy Policy</a>
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-blue-500/20 transform active:scale-[0.98] transition-all w-full flex items-center justify-center gap-3 disabled:opacity-70 mt-6"
                        >
                            {isSubmitting ? <Loader size="sm" /> : <span>Start Shopping Today</span>}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center mt-10 text-gray-500 text-sm font-medium">
                        Already part of our community?{' '}
                        <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 border-b-2 border-transparent hover:border-blue-600 transition-all ml-1">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
