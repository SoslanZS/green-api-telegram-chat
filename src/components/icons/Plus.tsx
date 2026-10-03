import type { SVGProps } from 'react';

const Plus = (props: SVGProps<SVGSVGElement>) => (
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
		<path d="M12 5v14M5 12h14" />
	</svg>
);

export default Plus;
