import { useState } from 'react';
import { ChatPage, LoginForm } from '@/components';
import type { Credentials } from '@/types';
import { loadFromStorage, removeFromStorage, saveToStorage } from '@/utils/storage';

const CREDENTIALS_KEY = 'green-api-credentials';

const App = () => {
	// variables
	const [credentials, setCredentials] = useState(() => loadFromStorage<Credentials | null>(CREDENTIALS_KEY, null));

	// functions
	const handleLogin = (value: Credentials) => {
		saveToStorage(CREDENTIALS_KEY, value);
		setCredentials(value);
	};

	const handleLogout = () => {
		removeFromStorage(CREDENTIALS_KEY);
		setCredentials(null);
	};

	if (!credentials)
		return <LoginForm onLogin={handleLogin} />;

	// key: a different instance gets a fresh ChatPage with its own state and polling loop
	return (
		<ChatPage
			key={credentials.idInstance}
			credentials={credentials}
			onLogout={handleLogout}
		/>
	);
};

export default App;
