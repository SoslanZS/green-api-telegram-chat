import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
	ChatNewChat,
	IconsLogout,
	IconsPlus,
	UiAvatar,
} from '@/components';
import { useChatsStore } from '@/hooks/useChatsStore';
import { getChatTitle } from '@/utils/chat-title';
import { formatTime } from '@/utils/format-time';
import './Sidebar.scss';

type Props = {
	idInstance: string;
	onLogout: () => void;
};

const ChatSidebar = ({ idInstance, onLogout }: Props) => {
	// variables
	const store = useChatsStore();
	const chats = store.chatList;
	const [isCreating, setIsCreating] = useState(false);

	// functions
	const handleCreate = async (phone: string) => {
		await store.openChatByPhone(phone);
		setIsCreating(false);
	};

	return (
		<aside className="chat-sidebar">
			<header className="chat-sidebar__header">
				<div className="chat-sidebar__header-info">
					<h2 className="chat-sidebar__header-title">Чаты</h2>
					<span className="chat-sidebar__header-instance">Инстанс {idInstance}</span>
				</div>
				<button
					className="g-icon-button"
					type="button"
					title="Новый чат"
					onClick={() => setIsCreating((value) => !value)}
				>
					<IconsPlus />
				</button>
				<button
					className="g-icon-button"
					type="button"
					title="Выйти"
					onClick={onLogout}
				>
					<IconsLogout />
				</button>
			</header>

			{isCreating && (
				<ChatNewChat
					onCreate={handleCreate}
					onCancel={() => setIsCreating(false)}
				/>
			)}

			{chats.length > 0 && (
				<ul className="chat-sidebar__list">
					{chats.map((chat) => {
						const lastMessage = chat.messages.at(-1);
						return (
							<li key={chat.chatId}>
								<button
									className={`chat-sidebar__list-item${chat.chatId === store.activeChatId ? ' chat-sidebar__list-item--active' : ''}`}
									type="button"
									onClick={() => store.selectChat(chat.chatId)}
								>
									<UiAvatar seed={chat.chatId} name={getChatTitle(chat)} />
									<span className="chat-sidebar__list-item-body">
										<span className="chat-sidebar__list-item-top">
											<span className="chat-sidebar__list-item-title">{getChatTitle(chat)}</span>
											<span className="chat-sidebar__list-item-time">{formatTime(lastMessage?.timestamp)}</span>
										</span>
										<span className="chat-sidebar__list-item-preview">
											{lastMessage
												? `${lastMessage.direction === 'outgoing' ? 'Вы: ' : ''}${lastMessage.text}`
												: 'Нет сообщений'}
										</span>
									</span>
								</button>
							</li>
						);
					})}
				</ul>
			)}

			{!chats.length && !isCreating && (
				<div className="chat-sidebar__empty">
					<p>Чатов пока нет</p>
					<button
						className="g-button"
						type="button"
						onClick={() => setIsCreating(true)}
					>
						Новый чат
					</button>
				</div>
			)}
		</aside>
	);
};

export default observer(ChatSidebar);
