import { useContext } from 'react';
import { ChatsStoreContext } from '@/stores/chats-store-context';

/**
 * Chats store of the current instance (provided by ChatPage)
 * @returns ChatsStore
 */
export const useChatsStore = () => {
	const store = useContext(ChatsStoreContext);
	if (!store)
		throw new Error('useChatsStore must be used inside ChatsStoreContext.Provider');

	return store;
};
