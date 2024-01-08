/**
 * External dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';

import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import ButtonGroup from '@mui/material/ButtonGroup';

import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';

import AsyncSelect from 'react-select/async';

import AddIcon from '@mui/icons-material/Add';
import { debounce } from 'lodash';

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: 48 * 4.5 + 8,
			width: 250,
		},
	},
};

const WCCompatibility = ( { global, variationID } ) => {
	const defaultData = [
		{
			type: 'product_tax',
			title: 'Product category',
			taxonomy: 'product_cat',
			include: [],
			exclude: [],
		},
	];
	let compatibilityDataDB = [],
		enableCompatibilityDB = 0;

	if ( global ) {
		compatibilityDataDB = WCCON_COMPATIBILITY.compatibility_data || [];
		enableCompatibilityDB = WCCON_COMPATIBILITY.enable_compatibility
			? parseInt( WCCON_COMPATIBILITY.enable_compatibility, 10 )
			: 0;
	} else {
		compatibilityDataDB = WCCON_COMPATIBILITY.variation_compatibility[ variationID ] || [];
		enableCompatibilityDB = WCCON_COMPATIBILITY.enable_compatibility_variation[ variationID ]
			? parseInt( WCCON_COMPATIBILITY.enable_compatibility_variation[ variationID ], 10 )
			: 0;
	}
	const [ enableCompatibility, setEnableCompatibility ] = useState( enableCompatibilityDB );
	const enableCompatibilityType = enableCompatibility ? true : false;
	const [ comparatorCompatibility, setComparatorCompatibility ] = useState(
		WCCON_COMPATIBILITY.comparator_compatibility
	);
	const [ strictTaxCompatibility, setStrictTaxCompatibility ] = useState(
		WCCON_COMPATIBILITY.strict_tax_compatibility ? parseInt( WCCON_COMPATIBILITY.strict_tax_compatibility, 10 ) : 0
	);
	const [ strictTermCompatibility, setStrictTermCompatibility ] = useState(
		WCCON_COMPATIBILITY.strict_term_compatibility
			? parseInt( WCCON_COMPATIBILITY.strict_term_compatibility, 10 )
			: 0
	);
	const [ compatibilityData, setCompatibilityData ] = useState( compatibilityDataDB );
	const [ enableGLobal, setEnableGLobal ] = useState(
		WCCON_COMPATIBILITY.global_compatibility ? parseInt( WCCON_COMPATIBILITY.global_compatibility, 10 ) : 0
	);

	const handleChangeAsyncSelect = ( val, index ) => {
		//console.log( val );

		const newData = compatibilityData.map( ( row, i ) => {
			if ( i === index ) {
				if ( ! val ) {
					return { ...row, title: '', taxonomy: '' };
				}
				return { ...row, title: val.label, taxonomy: val.value };
			}
			return row;
		} );
		setCompatibilityData( newData );
	};

	const handleChangeAsyncProducts = ( val, index ) => {
		//console.log( val );
		const newData = compatibilityData.map( ( row, i ) => {
			if ( i === index ) {
				return { ...row, value: val };
			}
			return row;
		} );
		setCompatibilityData( newData );
	};

	const handleChangeSelectMeta = ( e, index ) => {
		if ( e.target.value === '' ) return;

		const newData = compatibilityData.map( ( row, i ) => {
			if ( i === index ) {
				return { ...row, meta: e.target.value };
			}
			return row;
		} );

		setCompatibilityData( newData );
	};

	const setIncluded = ( e, index ) => {
		const value = e.target.value;

		const newData = compatibilityData.map( ( row, i ) => {
			if ( i === index ) {
				return { ...row, include: value };
			}
			return row;
		} );

		setCompatibilityData( newData );
	};

	const setExcluded = ( e, index ) => {
		const value = e.target.value;

		const newData = compatibilityData.map( ( row, i ) => {
			if ( i === index ) {
				return { ...row, exclude: value };
			}
			return row;
		} );

		setCompatibilityData( newData );
	};

	const addTaxonomyRow = () => {
		setCompatibilityData( [
			...compatibilityData,
			{
				type: 'product_tax',
				title: '',
				taxonomy: '',
				include: '',
				exclude: '',
			},
		] );
	};

	const addMetaRow = () => {
		setCompatibilityData( [
			...compatibilityData,
			{
				type: 'product_meta',
				title: __( 'Product meta', 'wccontour' ),
				meta: '',
				value: '',
			},
		] );
	};
	const setMetaValue = ( e, index ) => {
		const value = e.target.value;

		const newData = compatibilityData.map( ( row, i ) => {
			if ( i === index ) {
				return { ...row, value: value };
			}
			return row;
		} );

		setCompatibilityData( newData );
	};

	const addProductsRow = () => {
		const foundRow = compatibilityData.find( ( row ) => row.type === 'product_list' );

		if ( foundRow ) {
			return;
		}
		setCompatibilityData( [
			...compatibilityData,
			{
				type: 'product_list',
				title: __( 'Products', 'wccontour' ),
				value: '',
			},
		] );
	};

	const promiseOptions = ( inputValue: string, callback ) => {
		new Promise( ( resolve ) => {
			const formData = new FormData();

			formData.append( 'action', 'wccon_all_product_tax' );

			formData.append( 'field', inputValue );
			formData.append( 'all', true );
			formData.append( 'nonce', WCCON_COMPATIBILITY.nonce );

			try {
				fetch( WCCON_COMPATIBILITY.ajax_url, {
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
	const promiseOptionsProduct = ( inputValue: string, callback ) => {
		new Promise( ( resolve ) => {
			const formData = new FormData();

			formData.append( 'action', 'wccon_all_products' );

			formData.append( 'field', inputValue );
			formData.append( 'nonce', WCCON_COMPATIBILITY.nonce );
			try {
				fetch( WCCON_COMPATIBILITY.ajax_url, {
					method: 'POST',
					body: formData,
				} )
					.then( ( response ) => {
						return response.json();
					} )
					.then( ( result ) => {
						const newResult = result.data.fields.map( ( el ) => ( {
							label: el.post_title,
							value: el.ID,
						} ) );

						resolve( newResult );
					} );
			} catch ( err ) {
				console.log( err );
			}
		} ).then( ( res ) => {
			// console.log( res );
			callback( res );
		} );
	};
	const loadPromiseOptionsProduct = debounce( promiseOptionsProduct, 500 );
	const setGlobal = ( e ) => {
		e.target.checked ? setEnableGLobal( 1 ) : setEnableGLobal( 0 );
	};
	const removeRow = ( index ) => {
		const newData = compatibilityData.filter( ( row, i ) => {
			return i === index ? false : true;
		} );

		setCompatibilityData( newData );
	};
	const handleRelation = ( val ) => {
		setComparatorCompatibility( val );
	};
	const renderRow = ( row, index ) => {
		switch ( row.type ) {
			case 'product_tax':
				return (
					<Box sx={ { display: 'flex', mt: 2, mb: 1 } }>
						<FormControl sx={ { width: 400, mr: 2 } } className="wccon-async-select">
							<AsyncSelect
								defaultValue={
									row.title
										? [
												{
													label: row.title,
													value: row.taxonomy,
												},
										  ]
										: null
								}
								cacheOptions
								isClearable
								loadOptions={ loadPromiseOptions }
								placeholder={ __( 'Type to search…', 'wccontour' ) }
								onChange={ ( val ) => handleChangeAsyncSelect( val, index ) }
							/>
						</FormControl>
						<FormControl sx={ { flexDirection: 'row' } }>
							<TextField
								type="text"
								label={ __( 'Include terms' ) }
								value={ row.include }
								onChange={ ( e ) => setIncluded( e, index ) }
								helperText={ __( 'Term ids, separated by comma', 'wccontour' ) }
								sx={ { mr: 2 } }
							/>
							<TextField
								type="text"
								label={ __( 'Exclude terms' ) }
								value={ row.exclude }
								onChange={ ( e ) => setExcluded( e, index ) }
								helperText={ __( 'Term ids, separated by comma', 'wccontour' ) }
							/>
						</FormControl>
						<IconButton
							color="secondary"
							className="wccon-button-remove"
							onClick={ () => removeRow( index ) }
							sx={ { alignSelf: 'flex-start' } }
						>
							<DeleteIcon />
						</IconButton>
					</Box>
				);
			case 'product_meta':
				return (
					<Box sx={ { display: 'flex', mt: 2, mb: 1 } }>
						<FormControl sx={ { width: 400, mr: 2 } }>
							<InputLabel id={ `select-label-meta${ index }` }>{ row.title }</InputLabel>
							<Select
								labelId={ `select-label-meta${ index }` }
								value={ row.meta }
								onChange={ ( e ) => handleChangeSelectMeta( e, index ) }
								input={ <OutlinedInput label={ __( 'Product meta', 'wccontour' ) } /> }
								renderValue={ ( selected ) => (
									<Box
										sx={ {
											display: 'flex',
											flexWrap: 'wrap',
											gap: 0.5,
										} }
									>
										<Chip key={ selected } label={ selected } />
									</Box>
								) }
								MenuProps={ MenuProps }
							>
								{ WCCON_COMPATIBILITY.product_meta.map( ( component ) => (
									<MenuItem
										key={ component.value }
										value={ component.value }
										//   style={getStyles(name, personName, theme)}
									>
										{ component.label }
									</MenuItem>
								) ) }
							</Select>
						</FormControl>
						<FormControl sx={ { flexDirection: 'row' } }>
							<TextField
								type="text"
								label={ __( 'Value', 'wccontour' ) }
								value={ row.value }
								onChange={ ( e ) => setMetaValue( e, index ) }
								helperText={ __( 'Leave empty to include by meta_key', 'wccontour' ) }
							/>
						</FormControl>
						<IconButton
							color="secondary"
							className="wccon-button-remove"
							onClick={ () => removeRow( index ) }
							sx={ { alignSelf: 'flex-start' } }
						>
							<DeleteIcon />
						</IconButton>
					</Box>
				);
			case 'product_list':
				return (
					<Box sx={ { display: 'flex', mt: 2, mb: 2 } }>
						<FormControl sx={ { width: 400 } } className="wccon-async-select">
							<AsyncSelect
								value={ row.value }
								isMulti
								cacheOptions
								loadOptions={ loadPromiseOptionsProduct }
								placeholder={ __( 'Type to search…', 'wccontour' ) }
								onChange={ ( val ) => handleChangeAsyncProducts( val, index ) }
							/>
						</FormControl>
						<IconButton
							color="secondary"
							className="wccon-button-remove"
							onClick={ () => removeRow( index ) }
							sx={ { alignSelf: 'flex-start' } }
						>
							<DeleteIcon />
						</IconButton>
					</Box>
				);
		}
	};
	const getLabelName = ( enableCompatibility, global ) => {
		let name = '';
		if ( enableCompatibility ) {
			name = __( 'Disable Compatibility', 'wccontour' );
		} else {
			name = __( 'Enable Compatibility', 'wccontour' );
		}

		if ( ! global && enableCompatibility ) {
			name = __( 'Disable Compatibility', 'wccontour' );
		} else if ( ! global && ! enableCompatibility ) {
			name = __( 'Enable Compatibility', 'wccontour' );
		}
		return name;
	};
	return (
		<Box>
			<FormControlLabel
				control={
					<Switch
						color="primary"
						checked={ enableCompatibility ? true : false }
						onChange={ ( e ) =>
							e.target.checked ? setEnableCompatibility( 1 ) : setEnableCompatibility( 0 )
						}
					/>
				}
				label={ getLabelName( enableCompatibility, global ) }
			/>
			{ enableCompatibilityType && (
				<>
					{ global ? (
						<>
							<input type="hidden" name="wccon_global_compatibility" value={ enableGLobal } />
							<input
								type="hidden"
								name="wccon_compatibility_data"
								value={ JSON.stringify( compatibilityData ) }
							/>
							<input type="hidden" name="wccon_enable_compatibility" value={ enableCompatibility } />
							<input
								type="hidden"
								name="wccon_compatibility_comparator"
								value={ comparatorCompatibility }
							/>
							<input type="hidden" name="wccon_strict_taxonomy" value={ strictTaxCompatibility } />
							<input type="hidden" name="wccon_strict_term" value={ strictTermCompatibility } />
							<FormControlLabel
								control={
									<Switch
										color="primary"
										checked={ enableGLobal ? true : false }
										onChange={ setGlobal }
									/>
								}
								label={ __(
									'Global settings for product (enable this to override variation settings)',
									'wccontour'
								) }
							/>
						</>
					) : (
						<>
							<input
								type="hidden"
								name={ `wccon_compatibility_variation[${ variationID }]` }
								value={ JSON.stringify( compatibilityData ) }
							/>

							<input
								type="hidden"
								name={ `wccon_enable_variation_compatibility[${ variationID }]` }
								value={ enableCompatibility }
							/>
							<input
								type="hidden"
								name={ `wccon_comp_variation_compatibility[${ variationID }]` }
								value={ comparatorCompatibility }
							/>
							<input
								type="hidden"
								name={ `wccon_strict_tax_variation[${ variationID }]` }
								value={ strictTaxCompatibility }
							/>
							<input
								type="hidden"
								name={ `wccon_strict_term_variation[${ variationID }]` }
								value={ strictTermCompatibility }
							/>
						</>
					) }
					<Box
						sx={ {
							display: 'flex',
							columnGap: '10px',
							flexWrap: 'wrap',
							marginBottom: '10px',
						} }
					>
						<ButtonGroup disableElevation variant="contained" aria-label="Disabled elevation buttons">
							<Button
								variant={ comparatorCompatibility === 'or' ? 'contained' : 'outlined' }
								onClick={ () => handleRelation( 'or' ) }
							>
								OR
							</Button>
							<Button
								variant={ comparatorCompatibility === 'and' ? 'contained' : 'outlined' }
								onClick={ () => handleRelation( 'and' ) }
							>
								AND
							</Button>
						</ButtonGroup>
						<FormControlLabel
							control={
								<Switch
									color="primary"
									checked={ strictTaxCompatibility ? true : false }
									onChange={ ( e ) =>
										e.target.checked
											? setStrictTaxCompatibility( 1 )
											: setStrictTaxCompatibility( 0 )
									}
								/>
							}
							label={ __( 'Strict taxonomy/products', 'wccontour' ) }
						/>
						<FormControlLabel
							control={
								<Switch
									color="primary"
									checked={ strictTermCompatibility ? true : false }
									onChange={ ( e ) =>
										e.target.checked
											? setStrictTermCompatibility( 1 )
											: setStrictTermCompatibility( 0 )
									}
								/>
							}
							label={ __( 'Strict term taxonomy', 'wccontour' ) }
						/>
					</Box>
					<Stack direction="row" spacing={ 2 }>
						<Button
							color="secondary"
							variant="contained"
							startIcon={ <AddIcon /> }
							onClick={ addTaxonomyRow }
						>
							{ __( 'Taxonomy', 'wccontour' ) }
						</Button>
						<Button variant="contained" startIcon={ <AddIcon /> } onClick={ addMetaRow }>
							{ __( 'Meta field', 'wccontour' ) }
						</Button>
						<Button variant="contained" startIcon={ <AddIcon /> } onClick={ addProductsRow }>
							{ __( 'Products', 'wccontour' ) }
						</Button>
					</Stack>
					{ compatibilityData.map( ( row, index ) => (
						<Box key={ `row-${ index }` }>
							{ renderRow( row, index ) }
							{ index + 1 < compatibilityData.length && <Divider /> }
						</Box>
					) ) }
				</>
			) }
		</Box>
	);
};
export default WCCompatibility;
