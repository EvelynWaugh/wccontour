/**
 * External dependencies
 */
import { addFilter, applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

interface FieldType {
	id: string;
	name: string;
	desc?: string;
	type: string;
	action?: string;
	optgroup?: boolean;
	defaultValue: any;
	pro: boolean;
	location: string[];
	multiple?: boolean;
}

addFilter( 'wccontour-field-types', 'wc-contour', ( types: Array< FieldType > ) => {
	const requiredField: FieldType = {
		id: 'required',
		name: __( 'Required', 'wccontour' ),
		desc: __( 'Just mark as required', 'wccontour' ),
		type: 'bool',
		defaultValue: false,
		pro: false,
		location: [ 'component', 'subcomponent' ],
	};
	const extraField: FieldType = {
		id: 'extra',
		name: __( 'Is Extra component', 'wccontour' ),
		desc: __( 'Will be shown in collapsable extra block', 'wccontour' ),
		type: 'bool',
		defaultValue: false,
		pro: true,
		location: [ 'component' ],
	};
	const descriptionField: FieldType = {
		id: 'description',
		name: __( 'Description', 'wccontour' ),
		type: 'textarea',
		defaultValue: '',
		pro: false,
		location: [ 'group', 'component', 'subgroup', 'subcomponent' ],
	};

	const descriptionField2: FieldType = {
		id: 'description2',
		name: __( 'Description2', 'wccontour' ),
		type: 'textarea',
		defaultValue: '',
		location: [ 'group', 'component', 'subgroup' ],
	};

	const selectField: FieldType = {
		id: 'product_attribute',
		name: __( 'Product attribute', 'wccontour' ),
		type: 'async-select',
		action: 'wccon_product_attribute',
		multiple: true,
		optgroup: false,
		defaultValue: [],
		location: [ 'component' ],
	};

	const multiipleField: FieldType = {
		id: 'multiple',
		name: __( 'Multiple selection', 'wccontour' ),
		desc: __( 'Allow multiple products to be selected', 'wccontour' ),
		type: 'bool',
		defaultValue: false,
		pro: true,
		location: [ 'component', 'subcomponent' ],
	};
	const showimageInList: FieldType = {
		id: 'saved_image',
		name: __( 'Saved list image', 'wccontour' ),
		desc: __( "Component's image will be shown in saved lists", 'wccontour' ),
		type: 'bool',
		defaultValue: false,
		pro: true,
		location: [ 'component', 'subcomponent' ],
	};
	return [
		...types,
		requiredField,
		extraField,
		descriptionField,
		multiipleField,
		showimageInList,
		// descriptionField2,
		// selectField,
		// selectField2,
	];
} );

const defaultFilterItems = [
	{
		id: 'price',
		title: __( 'Filter by price', 'wccontour' ),
	},
	{
		id: 'product_tax',
		title: __( 'Filter by taxonomy', 'wccontour' ),
	},
	{
		id: 'product_attribute',
		title: __( 'Filter by attribute', 'wccontour' ),
	},
	{
		id: 'product_meta',
		title: __( 'Filter by meta', 'wccontour' ),
	},
];

addFilter( 'wccontour-filter-items', 'wc-contour', ( items ) => {
	return [ ...items, ...defaultFilterItems ];
} );

const shareLinks = [
	{
		id: 'link',
		label: __( 'Link' ),
		default: true,
	},
	{
		id: 'facebook',
		label: __( 'Facebook' ),
		default: true,
	},
	{
		id: 'twitter',
		label: __( 'Twitter' ),
		default: true,
	},
	{
		id: 'pinterest',
		label: __( 'Pinterest' ),
		default: false,
	},
	{
		id: 'telegram',
		label: __( 'Telegram' ),
		default: false,
	},
	{
		id: 'viber',
		label: __( 'Viber' ),
		default: false,
	},
	{
		id: 'whatsapp',
		label: __( 'Whatsapp' ),
		default: false,
	},

	{
		id: 'linkedin',
		label: __( 'Linkedin' ),
		default: false,
	},
];
addFilter( 'wccontour-social-items', 'wc-contour', ( items ) => {
	return [ ...items, ...shareLinks ];
} );
