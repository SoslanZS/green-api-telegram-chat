import type { SVGProps } from 'react';

const Alert = (props: SVGProps<SVGSVGElement>) => (
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
		<path d="M12 8v4M12 16h.01" />
	</svg>
);

export default Alert;
