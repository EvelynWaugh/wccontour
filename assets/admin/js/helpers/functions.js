export const findElementType = ( data, slug ) => {
	const foundElement = findElement( data, slug );
	//console.log( 'FOUND:', foundElement );
	if ( foundElement ) {
		if ( foundElement.hasOwnProperty( 'parent_id' ) && foundElement.parent_id !== 0 ) {
			return 'subgroup';
		}
		return foundElement.hasOwnProperty( 'parent_id' ) ? 'group' : 'component';
	}
	return false;
};

export const findElementTypeBeta = ( data, slug, depth=1 ) => {

	for ( const group of data ) {

		if ( group.slug === slug ) {
			return 'group';
		}

		for(const component of group.components) {
			if ( component.slug === slug ) {
				if(component.hasOwnProperty( 'components' )) {
					return 'subgroup';
				}
				return 'component';
			}
			if(component.hasOwnProperty( 'components' )) {
				for(const subcomponent of component.components) {
					if ( subcomponent.slug === slug ) {
						return 'subcomponent';
					}
				}
			}
		}
	}
	
};

export const findElement = ( data, slug ) => {
	let foundElement = null;
	// console.log( data );
	for ( const group of data ) {
		if ( group.slug === slug ) {
			return group;
		}
		if ( group.hasOwnProperty( 'components' ) ) {
			foundElement = findElement( group.components, slug );
			if ( foundElement ) {
				return foundElement;
			}
		}
	}
	return foundElement;
};

export const setElementMetaData = ( data, slug, fieldId, value ) => {
	return data.map( ( group ) => {
		if ( group.slug !== slug ) {
			if ( group.hasOwnProperty( 'components' ) ) {
				return {
					...group,
					components: setElementMetaData( group.components, slug, fieldId, value ),
				};
			}
			return group;
		}
		if ( fieldId === 'extra' ) {
			if(typeof group.meta.required !=='undefined' && group.meta.required !== false) {
				return { ...group, meta: { ...group.meta, [ fieldId ]: value, required: ! value } };

			}
		}
		if ( fieldId === 'required' ) {
			if(typeof group.meta.extra !=='undefined' && group.meta.extra !== false) {
				return { ...group, meta: { ...group.meta, [ fieldId ]: value, extra: ! value } };
			}
		}
		return { ...group, meta: { ...group.meta, [ fieldId ]: value } };
	} );
};

export const setElementWidgetData = ( data, slug, value, type ) => {
	return data.map( ( group ) => {
		if ( group.slug !== slug ) {
			if ( group.hasOwnProperty( 'components' ) ) {
				return {
					...group,
					components: setElementWidgetData( group.components, slug, value, type ),
				};
			}
			return group;
		}
		if ( type === 'remove' ) {
			return {
				...group,
				widgets: group.widgets.filter( ( widget, index ) => index !== value ),
			};
		}
		return { ...group, widgets: [ ...group.widgets, { ...value } ] };
	} );
};

export const setElementWidgetItem = ( data, slug, widgetIndex, value ) => {
	//console.log( 'VALUE', value );
	return data.map( ( group ) => {
		if ( group.slug !== slug ) {
			if ( group.hasOwnProperty( 'components' ) ) {
				return {
					...group,
					components: setElementWidgetItem( group.components, slug, widgetIndex, value ),
				};
			}
			return group;
		}
		return {
			...group,
			widgets: group.widgets.map( ( w, index ) => ( index === widgetIndex ? { ...w, ...value } : w ) ),
		};
	} );
};

export const setElementData = ( data, slug, fieldId, value ) => {
	return data.map( ( group ) => {
		if ( group.slug !== slug ) {
			if ( group.hasOwnProperty( 'components' ) ) {
				return {
					...group,
					components: setElementData( group.components, slug, fieldId, value ),
				};
			}
			return group;
		}
		return { ...group, [ fieldId ]: value };
	} );
};

export const setSubComponents = ( data, slug, fieldId, value, type ) => {
	return data
		.map( ( group ) => {
			if ( group.slug !== slug ) {
				if ( group.hasOwnProperty( 'components' ) ) {
					return {
						...group,
						components: setSubComponents( group.components, slug, fieldId, value, type ),
					};
				}
				return group;
			}
			if ( type === 'add' ) {
				const position = group[ fieldId ].length;
				return {
					...group,
					[ fieldId ]: [ ...group[ fieldId ], { ...value, position } ],
				};
			} else if ( type === 'remove' ) {
				return null;
			}
			return group;
		} )
		.filter( ( s ) => s !== null );
};

export const changeMetaValue = ( fieldId, value, data, slug, callback ) => {
	// console.log( data, fieldId, value );

	const newData = setElementMetaData( data, slug, fieldId, value );

	// console.log( newData );
	callback( newData );
};

export const changeWidgetValue = ( value, data, slug, callback, type = 'add' ) => {
	const newData = setElementWidgetData( data, slug, value, type );

	callback( newData );
};

export const changeWidgetItem = ( widgetIndex, value, data, slug, callback ) => {
	const newData = setElementWidgetItem( data, slug, widgetIndex, value );

	callback( newData );
};

export const changeMainValue = ( fieldId, value, data, slug, callback ) => {
	const newData = setElementData( data, slug, fieldId, value );

	callback( newData );
};

export const changeSubComponent = ( fieldId, value, data, slug, callback, type ) => {
	const newData = setSubComponents( data, slug, fieldId, value, type );

	callback( newData );
};

export const getImageUrl = ( id ) => {
	return wp.media.attachment( id ).get( 'url' );
};

export const getRandomId = ( shortcodes ) => {
	// console.log( shortcodes );
	const shortCodesIds = shortcodes.map( ( s ) => s.id );
	const multiplyValue = shortcodes.length > 99 ? 1000 : 100;
	const randomValue = Math.floor( Math.random() * multiplyValue );
	if ( shortCodesIds.includes( randomValue ) ) {
		return getRandomId( shortcodes );
	}
	return randomValue;
};

export const formatSelectValue = ( ids ) => {
	// console.log( 'ids:', ids );
	if ( ! Array.isArray( ids ) ) {
		return null;
	}
	const formattedValues = ids
		.map( ( id ) => {
			const foundData = WCCON_BUILDER_ADMIN.formatted_product_tax.find( ( el ) => {
				// console.log( el.value );
				const valueTax = parseInt( el.value, 10 );
				if ( isNaN( valueTax ) ) {
					// console.log( 'nan', el.value );
					return el.value === id;
				}
				return el.value === parseInt( id, 10 );
			} );
			if ( foundData ) {
				return foundData;
			}
			return false;
		} )
		.filter( ( el ) => el );
	// console.log( 'values:', formattedValues );
	return formattedValues;
};
