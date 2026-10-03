import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ChatSidebar, ChatWindow } from '@/components';
import { useNotifications } from '@/hooks/useNotifications';
import { ChatsStore } from '@/stores/chats-store';
import { ChatsStoreContext } from '@/stores/chats-store-context';
import type { Credentials } from '@/types';
import './Page.scss';

type Props = {
	credentials: Credentials;
	onLogout: () => void;
};

const ChatPage = ({ credentials, onLogout }: Props) => {
	// variables
	// One store per mounted page: App remounts the page (key) when the instance changes
	const [store] = useState(() => new ChatsStore(credentials));

	useEffect(() => store.persist(), [store]);
	useNotifications(credentials, store.handleNotification);

	return (
		<ChatsStoreContext.Provider value={store}>
			<div className={`chat-page${store.activeChat ? ' chat-page--chat-open' : ''}`}>
				<ChatSidebar idInstance={credentials.idInstance} onLogout={onLogout} />
				<ChatWindow />
			</div>
		</ChatsStoreContext.Provider>
	);
};

export default observer(ChatPage);
