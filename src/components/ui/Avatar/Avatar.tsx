import type { CSSProperties } from 'react';
import './Avatar.scss';

type Props = {
	seed: string;
	name: string;
	size?: number;
};

const COLORS = ['#3f8cff', '#8b4dff', '#ff7a45', '#12b886', '#f03e89', '#15aabf'];

// Stable color per chat: the same chatId always gets the same color
const pickColor = (seed: string): string => {
	let hash = 0;
	for (const char of String(seed))
		hash = (hash * 31 + char.charCodeAt(0)) >>> 0;

	return COLORS[hash % COLORS.length];
};

const getInitials = (name: string): string => {
	const letters = name
		.split(/\s+/)
		.filter((word) => /\p{L}/u.test(word[0] ?? ''))
		.slice(0, 2)
		.map((word) => word[0].toUpperCase());

	return letters.length ? letters.join('') : '#';
};

const UiAvatar = ({ seed, name, size = 48 }: Props) => (
	<div
		className="ui-avatar"
		style={{ '--ui-avatar-size': `${size}px`, backgroundColor: pickColor(seed) } as CSSProperties}
	>
		{getInitials(name)}
	</div>
);

export default UiAvatar;
