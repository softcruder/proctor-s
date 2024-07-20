import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import httpService from '@/services';
import { startAuthentication } from '@simplewebauthn/browser';
import { useUtilsContext } from './UtilsContext';

interface AuthContextType {
	user: any | null;
	login: (credentials: any) => Promise<void>;
	logout: () => void;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<any | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	const { notify } = useUtilsContext();

	useEffect(() => {
		checkUserSession();
	}, []);

	const checkUserSession = async () => {
		try {
			const response = await httpService.get('/api/auth/session');
			if (response.user) {
				setUser(response.user);
			} else {
				setUser(null);
			}
		} catch (error) {
			console.error('Session check failed:', error);
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	};

	const login = async (credentials: any) => {
		setIsLoading(true);
		try {
			const { authenticationOptions, id } = await httpService.post('/api/auth/authentication-options', credentials);

			let asseResp;
			try {
				// Pass the options to the authenticator and wait for a response
				asseResp = await startAuthentication(authenticationOptions);
			} catch (error) {
				// Some basic error handling
				const isString = typeof error === 'string';
				notify("An error occured!", { description: isString ? error : JSON.stringify(error), type: 'danger' });
				throw error;
			}
			const payload = {
				auth_options: asseResp,
				id,
			}

			const { user, session, success, message } = await httpService.post('/api/auth/verify-authentication', payload)

			if (success) {
				const { token } = session;

				// Set the session token in a cookie
				document.cookie = `session_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure' : ''}`;
				setUser(user);
				router.push('/dashboard');
			} else {
				throw new Error(message || 'Login failed');
			}
		} catch (error) {
			console.error('Login error:', error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const logout = async () => {
		setIsLoading(true);
		try {
			await httpService.post('/api/auth/logout', {});
			setUser(null);
			router.push('/login');
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthContext.Provider value={{ user, login, logout, isLoading }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};