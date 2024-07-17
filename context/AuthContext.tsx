// context/UserContext.tsx
"use client"
import { createContext, useContext, useState, ReactNode, FC } from 'react';
import { User } from '@/types/global';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import httpService from '@/services';
const { fetcher } = httpService;

interface UserContextType {
	user: User | null;
	setUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
	children: ReactNode;
}

export const AuthProvider: FC<UserProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);

	return (
		<UserContext.Provider value={{ user, setUser }}>
			{children}
		</UserContext.Provider>
	);
};

export const useAuthContext = (): UserContextType => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error('useUser must be used within a UserProvider');
	}
	return context;
};

export const useIsAuthenticated = () => {
	const { data, error } = useSWR('/api/user', fetcher, { shouldRetryOnError: false });
	return { data, error }
};
