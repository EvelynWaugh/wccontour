/**
 * External dependencies
 */
import { memo } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import Box from '@mui/material/Box';
import Grid2 from '@mui/material/Unstable_Grid2';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import AsyncSelect from 'react-select/async';
import { debounce } from 'lodash';

/**
 * Internal dependencies
 */

import { findElementType, findElementTypeBeta, changeMetaValue, formatSelectValue } from '../helpers/functions';

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: 48 * 4.5 + 8,
			width: 250,
		},
	},
};

const MetaFields = memo( ( props ) => {
	const { component, activeShortcode, setActiveShortcode } = props;
	const allFieldTypes = applyFilters( 'wccontour-field-types', [] );

	const isMultiLang = () => {
		if ( WCCON_BUILDER_ADMIN.languages && Array.isArray( WCCON_BUILDER_ADMIN.languages ) ) {
			return true;
		}
		return false;
	};
	const getDefaultLang = () => {
		return WCCON_BUILDER_ADMIN.languages[ 0 ].default;
	};

	const getMetaValue = ( id ) => {
		return component.meta[ id ];
	};
	const getMetaValueBool = ( id ) => {
		return component.meta[ id ] || component.meta[ id ] === '1' ? true : false;
	};
	// console.log( 'META', component, activeShortcode );
	const elementType = findElementTypeBeta( activeShortcode.groups, component.slug );
	// console.log( elementType );
	const filteredFieldTypes = allFieldTypes.filter( ( f ) => f.location.includes( elementType ) );

	const userPro = WCCON_BUILDER_ADMIN.pro ? true : false;
	// console.log( 'FILTERED:', filteredFieldTypes );
	const setSwitchField = ( e, id, pro ) => {
		if ( pro && ! userPro ) {
			return;
		}
		const value = e.target.checked;
		changeMetaValue( id, value, activeShortcode.groups, component.slug, ( data ) => {
			setActiveShortcode( { ...activeShortcode, groups: data } );
		} );
	};
	const setTextField = ( e, id ) => {
		const value = e.target.value;
		//console.log( value );
		changeMetaValue( id, value, activeShortcode.groups, component.slug, ( data ) => {
			setActiveShortcode( { ...activeShortcode, groups: data } );
		} );
		//console.log( value );
	};
	const handleChangeAsyncSelect = ( val, id ) => {
		//console.log( val );
		const valiIds = val.map( ( v ) => v.value );
		changeMetaValue( id, valiIds, activeShortcode.groups, component.slug, ( data ) => {
			setActiveShortcode( { ...activeShortcode, groups: data } );
		} );
	};

	const handleChangeSelect = ( e, id ) => {
		//console.log( e );
		if ( e.target.value === '' ) return;
		const selectedValues = typeof e.target.value === 'string' ? e.target.value.split( ',' ) : e.target.value;
		changeMetaValue( id, selectedValues, activeShortcode.groups, component.slug, ( data ) => {
			setActiveShortcode( { ...activeShortcode, groups: data } );
		} );
	};

	const renderField = ( id: string ) => {
		const dataForType = allFieldTypes.find( ( t ) => t.id === id );

		// console.log( 'TYPE:' + dataForType.type, elementType, dataForType );
		if ( ! elementType || ! dataForType ) {
			return;
		}
		const validLocations = dataForType.location;
		// console.log( validLocations );
		if ( ! validLocations.includes( elementType ) ) {
			return;
		}

		const promiseOptions = ( inputValue: string, callback ) => {
			new Promise( ( resolve ) => {
				const formData = new FormData();

				formData.append( 'action', dataForType.action );
				formData.append( 'nonce', WCCON_BUILDER_ADMIN.nonce );
				formData.append( 'field', inputValue );
				if ( isMultiLang() ) {
					if ( activeShortcode.lang ) {
						formData.append( 'lang', activeShortcode.lang );
					} else {
						formData.append( 'lang', getDefaultLang() );
					}
				}

				try {
					fetch( WCCON_BUILDER_ADMIN.ajax_url, {
						method: 'POST',
						body: formData,
					} )
						.then( ( response ) => {
							return response.json();
						} )
						.then( ( result ) => {
							//console.log( result );
							// const newResult = result.data.products.map(
							// 	( el ) => ( {
							// 		label: el.post_title,
							// 		value: el.ID,
							// 	} )
							// );
							// console.log( newResult );
							resolve( result.data.fields );
						} );
				} catch ( err ) {
					console.log( err );
				}
			} ).then( ( res ) => {
				// console.log( res );
				callback( res );
			} );
		};
		const loadPromiseOptions = debounce( promiseOptions, 500 );
		switch ( dataForType.type ) {
			case 'async-select':
				return (
					<FormControl>
						<AsyncSelect
							value={ formatSelectValue( getMetaValue( dataForType.id ) ) || dataForType.defaultValue }
							isMulti
							cacheOptions
							loadOptions={ loadPromiseOptions }
							placeholder={ __( 'Type to search…', 'wccontour' ) }
							onChange={ ( val ) => handleChangeAsyncSelect( val, dataForType.id ) }
							// getOptionValue={ ( option ) => {
							// 	console.log( option );
							// 	return option.value;
							// } }
						/>
						{ dataForType.desc !== '' && (
							<FormHelperText sx={ { mx: 0 } }>{ dataForType.desc }</FormHelperText>
						) }
					</FormControl>
				);
			case 'select':
				if ( dataForType.optgroup ) {
					return (
						<FormControl sx={ { mt: 0, width: 400 } }>
							<InputLabel id={ `select-label-${ dataForType.id }` }>{ dataForType.name }</InputLabel>
							<Select
								labelId={ `select-label-${ dataForType.id }` }
								multiple={ dataForType.multiple }
								value={ getMetaValue( dataForType.id ) || [] }
								onChange={ ( e ) => handleChangeSelect( e, dataForType.id ) }
								input={ <OutlinedInput label={ dataForType.name } /> }
								renderValue={ ( selected ) => (
									<Box
										sx={ {
											display: 'flex',
											flexWrap: 'wrap',
											gap: 0.5,
										} }
									>
										{ selected.map( ( value ) => {
											return <Chip key={ value } label={ value.substring( 0, 7 ) } />;
										} ) }
									</Box>
								) }
								MenuProps={ MenuProps }
							>
								{ dataForType.defaultValue.map( ( group ) => {
									return [
										<ListSubheader
											color="primary"
											sx={ {
												fontSize: '20px',
												fontWeight: 'bold',
											} }
											key={ group.id }
										>
											{ group.label }
										</ListSubheader>,
										group.children.map( ( component ) => {
											return (
												<MenuItem
													key={ component.value }
													value={ component.value }
													//   style={getStyles(name, personName, theme)}
												>
													{ component.label }
												</MenuItem>
											);
										} ),
									];
								} ) }
							</Select>
							{ dataForType.desc !== '' && (
								<FormHelperText sx={ { mx: 0 } }>{ dataForType.desc }</FormHelperText>
							) }
						</FormControl>
					);
				}
				return (
					<FormControl sx={ { mt: 0, width: 400 } }>
						<InputLabel id={ `select-label-${ dataForType.id }` }>{ dataForType.name }</InputLabel>
						<Select
							labelId={ `select-label-${ dataForType.id }` }
							multiple={ dataForType.multiple }
							value={ getMetaValue( dataForType.id ) || [] }
							onChange={ ( e ) => handleChangeSelect( e, dataForType.id ) }
							input={ <OutlinedInput label={ dataForType.name } /> }
							renderValue={ ( selected ) => (
								<Box
									sx={ {
										display: 'flex',
										flexWrap: 'wrap',
										gap: 0.5,
									} }
								>
									{ selected.map( ( value ) => {
										return <Chip key={ value } label={ value.substring( 0, 7 ) } />;
									} ) }
								</Box>
							) }
							MenuProps={ MenuProps }
						>
							{ dataForType.defaultValue.map( ( component ) => (
								<MenuItem
									key={ component.value }
									value={ component.value }
									//   style={getStyles(name, personName, theme)}
								>
									{ component.label }
								</MenuItem>
							) ) }
						</Select>
						{ dataForType.desc !== '' && (
							<FormHelperText sx={ { mx: 0 } }>{ dataForType.desc }</FormHelperText>
						) }
					</FormControl>
				);

			case 'text':
				return (
					<FormControl sx={ { mt: 0, width: '100%' } }>
						<TextField
							type="text"
							label={ dataForType.name }
							value={ getMetaValue( dataForType.id ) || dataForType.defaultValue }
							onBlur={ ( e ) => setTextField( e, dataForType.id ) }
						/>
						{ dataForType.desc !== '' && (
							<FormHelperText sx={ { mx: 0 } }>{ dataForType.desc }</FormHelperText>
						) }
					</FormControl>
				);
			case 'textarea':
				return (
					<FormControl sx={ { mt: 0, width: '100%' } }>
						<TextField
							type="text"
							label={ dataForType.name }
							defaultValue={ getMetaValue( dataForType.id ) || dataForType.defaultValue }
							onBlur={ ( e ) => setTextField( e, dataForType.id ) }
							multiline
							rows={ 4 }
						/>
						{ dataForType.desc !== '' && (
							<FormHelperText sx={ { mx: 0 } }>{ dataForType.desc }</FormHelperText>
						) }
					</FormControl>
				);
			case 'bool':
				return (
					<FormControl>
						<FormControlLabel
							control={
								<Switch
									color="primary"
									disabled={ dataForType.pro && ! userPro }
									checked={
										dataForType.pro && ! userPro
											? false
											: getMetaValueBool( dataForType.id ) || dataForType.defaultValue
									}
									onChange={ ( e ) => setSwitchField( e, dataForType.id, dataForType.pro ) }
								/>
							}
							label={
								dataForType.pro && ! userPro ? (
									<>
										{ dataForType.name }
										<span style={ { color: '#d32f2f' } }> PRO</span>
									</>
								) : (
									dataForType.name
								)
							}
							labelPlacement="start"
							sx={ { ml: 0, justifyContent: 'flex-end' } }
						/>
						{ dataForType.desc !== '' && (
							<FormHelperText sx={ { mx: 0 } }>{ dataForType.desc }</FormHelperText>
						) }
					</FormControl>
				);
		}
	};
	const fieldChunks = filteredFieldTypes.reduce( ( acc, item ) => {
		acc[ item.type ] = [].concat( acc[ item.type ] || [], item );
		return acc;
	}, {} );
	//console.log( fieldChunks );

	return (
		<Box sx={ { mt: 2 } }>
			<Grid2 container rowSpacing={ 1 } columnSpacing={ 1 }>
				{ Object.keys( fieldChunks ).map( ( m ) => {
					// console.log( m );
					const fieldsRender = fieldChunks[ m ].map( ( f ) => {
						let breakPoints = { xs: 12, sm: 12, md: 12, lg: 12 };
						if ( f.type === 'textarea' ) {
							breakPoints = { xs: 6, sm: 6, md: 6, lg: 6 };
							if ( fieldChunks[ m ].length === 1 ) {
								breakPoints = {
									xs: 12,
									sm: 12,
									md: 12,
									lg: 12,
								};
							}
						}
						return (
							<Grid2 key={ `key-${ f.id }` } { ...breakPoints }>
								{ renderField( f.id ) }
							</Grid2>
						);
					} );
					switch ( m ) {
						case 'bool':
							return (
								<Grid2 xs={ 12 } md={ 4 }>
									{ fieldsRender }
								</Grid2>
							);
						case 'textarea':
							return (
								<Grid2 container xs={ 6 }>
									{ fieldsRender }
								</Grid2>
							);
						case 'select':
						case 'async-select':
							return (
								<Grid2 xs={ 12 } md={ 4 }>
									{ fieldsRender }
								</Grid2>
							);
					}
				} ) }
			</Grid2>
		</Box>
	);
} );

export default MetaFields;
