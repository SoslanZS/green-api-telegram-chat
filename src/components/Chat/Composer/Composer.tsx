import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { IconsSend } from '@/components';
import './Composer.scss';

type Props = {
	onSend: (text: string) => void;
};

const ChatComposer = ({ onSend }: Props) => {
	// variables
	const [text, setText] = useState('');
	const canSend = text.trim().length > 0;

	// functions
	const send = () => {
		if (!canSend)
			return;

		onSend(text.trim());
		setText('');
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		send();
	};

	// Enter sends, Shift+Enter adds a new line; isComposing skips IME input confirmation
	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
			event.preventDefault();
			send();
		}
	};

	return (
		<form className="chat-composer" onSubmit={handleSubmit}>
			<textarea
				className="chat-composer__input"
				value={text}
				onChange={(event) => setText(event.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="Сообщение"
				rows={1}
				autoFocus
			/>
			<button
				className="chat-composer__send"
				type="submit"
				title="Отправить"
				disabled={!canSend}
			>
				<IconsSend />
			</button>
		</form>
	);
};

export default ChatComposer;
