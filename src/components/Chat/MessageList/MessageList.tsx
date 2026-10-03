import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { ChatMessage } from '@/components';
import type { Message } from '@/types';
import './MessageList.scss';

type Props = {
	messages: Message[];
};

const ChatMessageList = ({ messages }: Props) => {
	// variables
	const bottomRef = useRef<HTMLDivElement>(null);

	// Keep the latest message visible (scrolling is the one thing React can't do declaratively)
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ block: 'end' });
	}, [messages.length]);

	if (!messages.length) {
		return (
			<div className="chat-message-list chat-message-list--empty">
				<p className="chat-message-list__hint">Сообщений пока нет. Напишите первым</p>
			</div>
		);
	}

	return (
		<div className="chat-message-list">
			{messages.map((message) => (
				<ChatMessage key={message.id} message={message} />
			))}
			<div ref={bottomRef} />
		</div>
	);
};

export default observer(ChatMessageList);
