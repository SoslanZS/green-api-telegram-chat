import { useState, type FormEvent } from 'react';
import { GreenApiError } from '@/api/green-api';
import { IconsClose } from '@/components';
import './NewChat.scss';

type Props = {
	onCreate: (phone: string) => Promise<void>;
	onCancel: () => void;
};

const ChatNewChat = ({ onCreate, onCancel }: Props) => {
	// variables
	const [phone, setPhone] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	// functions
	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!phone.trim() || isLoading)
			return;

		setError('');
		setIsLoading(true);
		try {
			// On success the parent closes (unmounts) this form
			await onCreate(phone);
		}
		catch (e) {
			if (e instanceof GreenApiError)
				setError(`Ошибка GREEN-API (${e.status}). Попробуйте ещё раз`);
			else
				setError(e instanceof Error ? e.message : 'Что-то пошло не так');
			setIsLoading(false);
		}
	};

	return (
		<form className="chat-new-chat" onSubmit={handleSubmit}>
			<div className="chat-new-chat__top">
				<span className="chat-new-chat__top-title">Новый чат</span>
				<button
					className="g-icon-button"
					type="button"
					title="Закрыть"
					onClick={onCancel}
				>
					<IconsClose />
				</button>
			</div>
			<input
				className="g-input"
				value={phone}
				onChange={(event) => setPhone(event.target.value)}
				type="tel"
				placeholder="Номер получателя, +7 999 123-45-67"
				autoFocus
			/>
			{error && <p className="g-error">{error}</p>}
			<button
				className="g-button"
				type="submit"
				disabled={!phone.trim() || isLoading}
			>
				{isLoading ? 'Ищем в Telegram...' : 'Создать чат'}
			</button>
		</form>
	);
};

export default ChatNewChat;
