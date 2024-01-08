import { createTheme } from '@mui/material/styles';
import { blue, red } from '@mui/material/colors';
const theme = createTheme( {
	palette: {
		productQuery: {
			main: blue[ 100 ],
			darker: blue[ 800 ],
			contrastText: '#333',
		},
		filters: {
			main: blue[ 50 ],
			darker: blue[ 100 ],
		},
		wcerror: {
			main: red[ 700 ],
			darker: red[ 800 ],
			contrastText: '#fff',
		},
	},
	breakpoints: {
		values: {
			xs: 0,
			sm: 600,
			md: 900,
			lg: 1200,
			clg: 1300,
			xl: 1536,
		},
	},
	zIndex: {
		speedDial: 1050,
		snackbar: 1400,
		modal: 12130,
		tooltip: 1500,
	},
} );

declare module '@mui/material/styles' {
	interface BreakpointOverrides {
		clg: true;
	}
}

declare module '@mui/material/styles' {
	interface Palette {
		productQuery: PaletteColorOptions;
		filters: PaletteColorOptions;
		wcerror: PaletteColorOptions;
	}

	// allow configuration using `createTheme`
	interface PaletteOptions {
		productQuery?: PaletteColorOptions;
		filters?: PaletteColorOptions;
		wcerror?: PaletteColorOptions;
	}
}

declare module '@mui/material/Button' {
	interface ButtonPropsColorOverrides {
		productQuery: true;
		filters: true;
		wcerror: true;
	}
}
declare module '@mui/material/IconButton' {
	interface ButtonPropsColorOverrides {
		productQuery: true;
		filters: true;
		wcerror: true;
	}
}
declare module '@mui/material/ButtonGroup' {
	interface ButtonPropsColorOverrides {
		productQuery: true;
		filters: true;
	}
}
export default theme;
