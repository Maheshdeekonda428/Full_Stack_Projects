import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await api.post('/auth/forgot-password', { email: email.toLowerCase() });
            toast.success(response.data.message);
            setIsSubmitted(true);
        } catch (error) {
            // Error handling is managed by axios interceptor
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8 animate-zoom-in">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-2xl">S</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
                        <p className="text-gray-600 mt-2">Enter your email to receive a reset link</p>
                    </div>

                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="input-field"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full flex items-center justify-center"
                            >
                                {isSubmitting ? <Loader size="sm" /> : 'Send Reset Link'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center">
                            <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6 text-sm">
                                If an account exists for {email}, a password reset link has been sent.
                            </div>
                            <p className="text-gray-600 text-sm">
                                Check your email (and spam folder) for further instructions.
                            </p>
                        </div>
                    )}

                    <p className="text-center mt-8 text-gray-600">
                        Remember your password?{' '}
                        <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
