/**
 * External dependencies
 */
import { v4 as uuid } from 'uuid';
import { __ } from '@wordpress/i18n';
import { addFilter, applyFilters } from '@wordpress/hooks';

const allFieldTypes = applyFilters( 'wccontour-field-types', [] );
const extraGroupMeta = allFieldTypes
	.filter( ( t ) => t.location.includes( 'group' ) )
	.map( ( t ) => ( { [ t.id ]: t.defaultValue } ) );
const extraSubGroupMeta = allFieldTypes
	.filter( ( t ) => t.location.includes( 'subgroup' ) )
	.map( ( t ) => ( { [ t.id ]: t.defaultValue } ) );

const extraComponentMeta = allFieldTypes
	.filter( ( t ) => t.location.includes( 'component' ) )
	.map( ( t ) => ( { [ t.id ]: t.defaultValue } ) );
export const getEmptyGroup = () => {
	return {
		id: 0,
		slug: uuid(),
		title: __( 'New Group', 'wccontour' ),
		parent_id: 0,
		image_id: 0,
		components: [],
		meta: extraGroupMeta.reduce( ( acc, item ) => ( { ...acc, ...item } ), {} ),
		position: null,
	};
};
export const getEmptySubGroup = () => {
	return {
		id: 0,
		slug: uuid(),
		title: __( 'New Group', 'wccontour' ),
		parent_id: 0,
		image_id: 0,
		components: [],
		meta: extraSubGroupMeta.reduce( ( acc, item ) => ( { ...acc, ...item } ), {} ),
		position: null,
	};
};
export const getEmptyComponent = () => {
	const componentMeta = {
		product_query: [],
	};
	return {
		id: 0,
		slug: uuid(),
		title: __( 'New Component', 'wccontour' ),
		image_id: 0,
		meta: {
			...componentMeta,
			...extraComponentMeta.reduce( ( acc, item ) => ( { ...acc, ...item } ), {} ),
		},
		widgets: [],
		position: null,
	};
};
