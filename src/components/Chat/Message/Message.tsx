import type { ComponentType, SVGProps } from 'react';
import { observer } from 'mobx-react-lite';
import {
	IconsAlert,
	IconsCheck,
	IconsCheckDouble,
	IconsClock,
} from '@/components';
import type { Message, MessageStatus } from '@/types';
import { formatTime } from '@/utils/format-time';
import './Message.scss';

type Props = {
	message: Message;
};

type StatusIcon = {
	Icon: ComponentType<SVGProps<SVGSVGElement>>;
	title: string;
};

// Built lazily: icons come from the components index, which is still loading when this module runs
const getStatusIcon = (status: MessageStatus): StatusIcon => {
	const icons: Record<MessageStatus, StatusIcon> = {
		pending: { Icon: IconsClock, title: 'Отправляется' },
		sent: { Icon: IconsCheck, title: 'Отправлено' },
		delivered: { Icon: IconsCheckDouble, title: 'Доставлено' },
		read: { Icon: IconsCheckDouble, title: 'Прочитано' },
		failed: { Icon: IconsAlert, title: 'Не отправлено' },
	};

	return icons[status];
};

const ChatMessage = ({ message }: Props) => {
	const status = message.direction === 'outgoing' && message.status ? getStatusIcon(message.status) : null;

	return (
		<div className={`chat-message chat-message--${message.direction}`}>
			<div className="chat-message__bubble">
				<span className="chat-message__bubble-text">{message.text}</span>
				<span className="chat-message__bubble-meta">
					{formatTime(message.timestamp)}
					{status && (
						<status.Icon
							className={`chat-message__bubble-status chat-message__bubble-status--${message.status}`}
							aria-label={status.title}
						/>
					)}
				</span>
			</div>
		</div>
	);
};

export default observer(ChatMessage);
