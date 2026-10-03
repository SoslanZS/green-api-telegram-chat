import type { SVGProps } from 'react';

const CheckDouble = (props: SVGProps<SVGSVGElement>) => (
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
		<path d="m2 12 5 5L17 7" />
		<path d="m12 16 1 1L23 7" />
	</svg>
);

export default CheckDouble;
