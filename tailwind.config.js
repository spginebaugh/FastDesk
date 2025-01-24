/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			border: "hsl(var(--border))",
  			input: "hsl(var(--input))",
  			ring: "hsl(var(--ring))",
  			background: "hsl(var(--background))",
  			foreground: "hsl(var(--foreground))",
  			// Brand Colors - Primary Neons
  			primary: {
  				DEFAULT: "hsl(var(--primary))",
  				foreground: "hsl(var(--primary-foreground))",
  				light: '#2DE2E6',    // Cyan neon
  				dark: '#FF3864',     // Bright red
  			},
  			
  			// Secondary Colors - Purples
  			secondary: {
  				DEFAULT: "hsl(var(--secondary))",
  				foreground: "hsl(var(--secondary-foreground))",
  				light: '#791E94',
  				dark: '#540D6E',
  			},
  			
  			// Background Colors - Dark Theme
  			background: {
  				DEFAULT: '#0D0221',  // Darkest purple
  				alt: '#241734',      // Dark purple
  				raised: '#261447',   // Medium dark purple
  				accent: '#2E2157',   // Light purple
  			},
  			
  			// Accent Colors - Vibrant
  			accent: {
  				DEFAULT: "hsl(var(--accent))",
  				foreground: "hsl(var(--accent-foreground))",
  				yellow: '#FFC611',
  				pink: {
  					light: '#F6019D',
  					DEFAULT: '#D40078',
  					dark: '#920075',
  				},
  				blue: '#023788',
  				red: {
  					light: '#FD3777',
  					DEFAULT: '#FD1D53',
  					dark: '#FF4365',
  				},
  			},
  			
  			// Semantic Colors
  			semantic: {
  				success: '#2DE2E6',    // Cyan
  				warning: '#F9C80E',    // Yellow
  				error: '#FF3864',      // Red
  				info: '#541388',       // Purple
  			},
  			destructive: {
  				DEFAULT: "hsl(var(--destructive))",
  				foreground: "hsl(var(--destructive-foreground))",
  			},
  			muted: {
  				DEFAULT: "hsl(var(--muted))",
  				foreground: "hsl(var(--muted-foreground))",
  			},
  			popover: {
  				DEFAULT: "hsl(var(--popover))",
  				foreground: "hsl(var(--popover-foreground))",
  			},
  			card: {
  				DEFAULT: "hsl(var(--card))",
  				foreground: "hsl(var(--card-foreground))",
  			},
  		},
  		
  		// Typography Scale
  		fontSize: {
  			xs: ['0.75rem', { lineHeight: '1rem' }],
  			sm: ['0.875rem', { lineHeight: '1.25rem' }],
  			base: ['1rem', { lineHeight: '1.5rem' }],
  			lg: ['1.125rem', { lineHeight: '1.75rem' }],
  			xl: ['1.25rem', { lineHeight: '1.75rem' }],
  			'2xl': ['1.5rem', { lineHeight: '2rem' }],
  			'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  			'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  			'5xl': ['3rem', { lineHeight: '1' }],
  		},

  		// Border Radius
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  		},

  		// Spacing System
  		spacing: {
  			px: '1px',
  			0: '0',
  			0.5: '0.125rem',
  			1: '0.25rem',
  			2: '0.5rem',
  			3: '0.75rem',
  			4: '1rem',
  			5: '1.25rem',
  			6: '1.5rem',
  			8: '2rem',
  			10: '2.5rem',
  			12: '3rem',
  			16: '4rem',
  			20: '5rem',
  			24: '6rem',
  			32: '8rem',
  			40: '10rem',
  			48: '12rem',
  			56: '14rem',
  			64: '16rem',
  		},

  		// Animation
  		animation: {
  			'glow': 'glow 2s ease-in-out infinite alternate',
  		},
  		keyframes: {
  			glow: {
  				'from': { 'text-shadow': '0 0 10px #F700CF, 0 0 20px #F700CF, 0 0 30px #F700CF' },
  				'to': { 'text-shadow': '0 0 20px #2DE2E6, 0 0 30px #2DE2E6, 0 0 40px #2DE2E6' }
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

