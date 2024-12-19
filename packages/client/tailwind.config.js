/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./src/**/*.{ts,tsx}",
	],
	theme: {
		extend: {
			colors: {
				darkPurple: '#0F0D30',
				mediumPurple: '#272545',
				purple: '#382377',
				lightPurple: '#3f3d59',
				darkestPurple: '#0b0922',
				backgroundPurple: '#7755CC12' // #7755CC at 7% opacity
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [
		function ({ addUtilities }) {
			addUtilities({
				'.custom-radio': {
					'appearance': 'none',
					'background-color': '#fff',
					'border': '1px solid #d1d5db',
					'border-radius': '50%',
					'width': '1rem',
					'height': '1rem',
					'display': 'inline-block',
					'position': 'relative',
				},
				'.custom-radio:checked': {
					'background-color': '#382377',
					'border': 'none',
					'background-image': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 20 20' fill='none' stroke='white' stroke-width='0' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='5' fill='white'/%3E%3C/svg%3E\")",
					'background-size': '1rem 1rem',
					'background-position': 'center',
					'background-repeat': 'no-repeat',
				},
				'.custom-radio:focus': {
					'outline': 'none',
					'box-shadow': '0 0 0 2px #c7d2fe',
				},
			});
		},
		require("tailwindcss-animate")
	],
};

