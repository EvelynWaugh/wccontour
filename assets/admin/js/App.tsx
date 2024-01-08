/**
 * External dependencies
 */

import { render, StrictMode } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ThemeProvider } from '@mui/material/styles';

/**
 * Internal dependencies
 */
import '../sass/main.scss';
import wcconTheme from './helpers/theme';

import WCBuilder from './components/Builder';
const App = () => {
	return (
		<ThemeProvider theme={ wcconTheme }>
			<div>
				<StrictMode>
					<WCBuilder />
				</StrictMode>
			</div>
		</ThemeProvider>
	);
};

render( <App />, document.getElementById( 'wc-contour' ) );
