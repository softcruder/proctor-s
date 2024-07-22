"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import httpService from '@/services';
import { startAuthentication } from '@simplewebauthn/browser';
import { useUtilsContext } from './UtilsContext';

interface AuthContextType {
	user: any | null;
	login?: (credentials: any) => Promise<void>;
	logout: () => void;
	setSessionId: (id: string) => void;
	setUser: (id: string) => void;
	sessionId: string | null;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<any | null>(null);
	const [sessionId, setSessionId] = useState<string | null>('');
	const [isLoading, setIsLoading] = useState(true);
	// const router = useRouter
	const router = useRouter();
	const { notify } = useUtilsContext();

	const checkUserSession = async () => {
		try {
			const response = await httpService.get(`/api/auth/session?id=${user.id}`);
			if (response.user) {
				setUser(response.user);
				setSessionId(response.session.id)
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
		  const { authenticationOptions, id, ...additional_details } = await httpService.post('/api/auth/authentication-options', credentials);
		//   console.log({...authenticationOptions, ...additional_details});
	
		  const asseResp = await startAuthentication({...authenticationOptions});
	
		  const payload = {
			auth_options: asseResp,
			challenge: additional_details.challenge,
			id,
		  }
	
		  const { user, session, success, message } = await httpService.post('/api/auth/verify-authentication', payload)
	
		  if (success) {
			const { token, id } = session;
	
			// Set the session token in a cookie
			document.cookie = `session_token=${token}; path=/; max-age=${24 * 60 * 60}; SameSite=Strict; ${process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' ? 'Secure' : ''}`;
			setUser(user);
			setSessionId(id);
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
			setSessionId(null);
			router.push('/login');
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		checkUserSession();
	}, []);


	return (
		<AuthContext.Provider value={{ setUser, user, login, logout, setSessionId, sessionId, isLoading }}>
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