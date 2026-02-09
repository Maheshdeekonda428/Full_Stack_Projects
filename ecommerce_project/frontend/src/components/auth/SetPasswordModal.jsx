import { useState } from 'react';
import userService from '../../services/userService';
import toast from 'react-hot-toast';
import Loader from '../common/Loader';

const SetPasswordModal = ({ user, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }

        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        try {
            setLoading(true);
            await userService.updateProfile({
                name: user.name,
                email: user.email,
                password
            });
            toast.success('Password set successfully! Your browser may ask to save it.');
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to set password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-zoom-in">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
                    <p className="text-gray-600 mt-2">
                        Set a password so you can log in later with your email or Google.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="input-field"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="input-field"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-3 flex items-center justify-center"
                    >
                        {loading ? <Loader size="sm" /> : 'Complete Setup'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetPasswordModal;
