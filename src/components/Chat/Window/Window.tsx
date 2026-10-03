import { observer } from 'mobx-react-lite';
import {
	ChatComposer,
	ChatMessageList,
	IconsBack,
	IconsChat,
	UiAvatar,
} from '@/components';
import { useChatsStore } from '@/hooks/useChatsStore';
import { getChatTitle } from '@/utils/chat-title';
import { formatPhone } from '@/utils/phone';
import './Window.scss';

const ChatWindow = () => {
	// variables
	const store = useChatsStore();
	const chat = store.activeChat;

	if (!chat) {
		return (
			<section className="chat-window chat-window--empty">
				<div className="chat-window__placeholder">
					<IconsChat className="chat-window__placeholder-icon" />
					<p>Выберите чат или создайте новый по номеру телефона</p>
				</div>
			</section>
		);
	}

	const title = getChatTitle(chat);
	const subtitle = chat.name && chat.phone ? formatPhone(chat.phone) : 'Telegram';

	return (
		<section className="chat-window">
			<header className="chat-window__header">
				<button
					className="g-icon-button chat-window__header-back"
					type="button"
					title="Назад"
					onClick={() => store.selectChat(null)}
				>
					<IconsBack />
				</button>
				<UiAvatar
					seed={chat.chatId}
					name={title}
					size={40}
				/>
				<div className="chat-window__header-info">
					<span className="chat-window__header-title">{title}</span>
					<span className="chat-window__header-subtitle">{subtitle}</span>
				</div>
			</header>

			<ChatMessageList messages={chat.messages} />

			{/* key resets the draft when switching chats */}
			<ChatComposer key={chat.chatId} onSend={(text) => store.sendMessage(chat.chatId, text)} />
		</section>
	);
};

export default observer(ChatWindow);
