import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const login = async (credentials, isSilent = false) => {
        try {
            setLoading(true);
            console.log('AuthContext: Calling authService.login...');
            const startTime = Date.now();
            await authService.login(credentials);
            console.log(`AuthContext: authService.login finished in ${Date.now() - startTime}ms`);

            const currentUser = authService.getCurrentUser();
            setUser(currentUser);
            if (!isSilent) {
                toast.success('Login successful!');
            }
            return { success: true };
        } catch (error) {
            console.error('AuthContext: login error:', error);
            const message = error.response?.data?.detail || 'Login failed';
            if (!isSilent) {
                toast.error(message);
            }
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = async (token) => {
        try {
            setLoading(true);
            const response = await authService.googleLogin(token);
            setUser(response.user);
            toast.success('Google login successful!');
            return { success: true, ...response };
        } catch (error) {
            const message = error.response?.data?.detail || 'Google login failed';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            const response = await authService.register(userData);
            setUser(response.user);
            toast.success('Registration successful!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.detail || 'Registration failed';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        toast.success('Logged out successfully');
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const storeCredentials = async (email, password, displayName = null) => {
        if (window.PasswordCredential && navigator.credentials?.store) {
            try {
                console.log('AuthContext: Attempting to store credentials for:', email);
                // Construct the credential object
                const cred = new window.PasswordCredential({
                    id: email,
                    password: password,
                    name: displayName || user?.name || email,
                    // iconURL: window.location.origin + '/logo192.png'
                });

                // Store it - this usually triggers the browser's "Save Password" prompt
                // if it's called during a user gesture (like a button click)
                await navigator.credentials.store(cred);
                console.log('AuthContext: Credentials stored successfully via Credential Management API');
                return true;
            } catch (err) {
                console.warn('AuthContext: Credential Management API error:', err);
                return false;
            }
        } else {
            console.log('AuthContext: Credential Management API or PasswordCredential not supported in this browser.');
            return false;
        }
    };

    const value = {
        user,
        loading,
        login,
        googleLogin,
        register,
        logout,
        updateUser,
        storeCredentials,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
