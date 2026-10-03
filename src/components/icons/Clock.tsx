import type { SVGProps } from 'react';

const Clock = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox="0 0 24 24"
		width="100%"
		height="100%"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
		{...props}
	>
		<circle cx="12" cy="12" r="9" />
		<path d="M12 7v5l3 2" />
	</svg>
);

export default Clock;
