/**
 * External dependencies
 */

import { render } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import WCCompatibility from './components/Compatibility';
import '../sass/admin.scss';
jQuery( '#woocommerce-product-data' ).on( 'woocommerce_variations_loaded', function () {
	const selectors = document.querySelectorAll( '.wccon-compatibility-section:not(.single-compat)' );
	selectors.forEach( ( el, i ) => {
		//console.log( el, i );
		const variationID = el.dataset.variationId;
		render( <WCCompatibility variationID={ variationID } />, el );
	} );
} );

render( <WCCompatibility global />, document.querySelector( '.wccon-compatibility-section' ) );
