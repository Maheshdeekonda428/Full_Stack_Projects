import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [devToken, setDevToken] = useState(null);
    const [showDevLink, setShowDevLink] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await api.post('/auth/forgot-password', { email: email.toLowerCase() });
            toast.success(response.data.message);

            // Development Shortcut: Capture token and show link after 10s
            if (response.data.dev_token) {
                setDevToken(response.data.dev_token);
                setTimeout(() => {
                    setShowDevLink(true);
                }, 10000);
            }

            setIsSubmitted(true);
        } catch (error) {
            // Error handling is managed by axios interceptor
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50/50 backdrop-blur-sm">
            <div className="w-full max-w-lg">
                <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl shadow-2xl p-10 animate-fade-in-up">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200 animate-bounce-slow">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Forgot Password?</h1>
                        <p className="text-gray-500 mt-3 text-lg leading-relaxed"> No worries! Enter your email and we'll send you a secure link to reset it. </p>
                    </div>

                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 ml-1">
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
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="input-field pl-11 py-3.5 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 placeholder:text-gray-400"
                                        placeholder="Enter your registered email"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {isSubmitting ? (
                                    <Loader size="sm" />
                                ) : (
                                    <>
                                        <span>Send Security Link</span>
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center animate-fade-in">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="bg-blue-50/50 border border-blue-100 text-blue-800 p-6 rounded-2xl mb-8 leading-relaxed">
                                <p className="font-semibold text-base mb-2">Check your inbox!</p>
                                <p className="text-sm opacity-90">
                                    If <span className="font-bold underlineDecoration">{email}</span> is registered, a secure reset link is on its way.
                                </p>
                            </div>
                            <div className="space-y-4 text-sm text-gray-600">
                                <p className="flex items-center justify-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    Link stays valid for 15 minutes
                                </p>
                                <p className="flex items-center justify-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    Check your spam or junk folder
                                </p>
                            </div>

                            {/* Development Bypass Link - Appears after 10s */}
                            {devToken && (
                                <div className={`mt-8 pt-6 border-t border-gray-100 transition-all duration-700 ${showDevLink ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                                    <Link
                                        to={`/reset-password/${devToken}`}
                                        className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                        Directly Reset Password (Dev Shortcut)
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                        <Link to="/login" className="inline-flex items-center gap-2 text-gray-500 font-medium hover:text-blue-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Secure Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
