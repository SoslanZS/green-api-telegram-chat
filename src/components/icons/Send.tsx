import type { SVGProps } from 'react';

const Send = (props: SVGProps<SVGSVGElement>) => (
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
		<path d="M4 12 20 4l-4 16-4-7-8-1Z" />
		<path d="m12 13 8-9" />
	</svg>
);

export default Send;
