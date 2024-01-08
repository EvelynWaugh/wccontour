/**
 * External dependencies
 */

import { useState, memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import IconButton from '@mui/material/IconButton';

import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';

import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import styled from '@emotion/styled';

import AsyncSelect from 'react-select/async';
import ButtonGroup from '@mui/material/ButtonGroup';
import { Box, Tooltip, Typography } from '@mui/material';
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
import { debounce } from 'lodash';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import FormHelperText from '@mui/material/FormHelperText';

/**
 * Internal dependencies
 */
import { changeMetaValue, changeWidgetValue, changeWidgetItem, formatSelectValue } from '../helpers/functions';
import { BootstrapDialogTitle, ProductQueryDialog } from '../styled-components/components';

const ExpandMore = styled( IconButton )`
	transform: ${ ( props ) => ( props.expand ? 'rotate(180deg)' : 'rotate(0deg)' ) };
	margin-left: auto;
`;

const ProductQueryGroup = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: relative;

	border-bottom: ${ ( props ) => ( props.isLastQuery ? '' : '1px solid #ddd' ) };

	padding-bottom: 30px;
`;

const ProductQueryRow = styled.div`
	&:not( :nth-of-type( 2 ) ) {
		padding-top: 20px;
	}
`;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: 48 * 4.5 + 8,
			width: 250,
		},
	},
};

const ProductQuery = memo( ( props ) => {
	const { component, activeShortcode, setActiveShortcode } = props;

	const [ openedQuery, setOpenedQuery ] = useState( false );
	const [ anchorElQuery, setAnchorElQuery ] = useState( null );

	const openQuery = Boolean( anchorElQuery );

	const isMultiLang = () => {
		if ( WCCON_BUILDER_ADMIN.languages && Array.isArray( WCCON_BUILDER_ADMIN.languages ) ) {
			return true;
		}
		return false;
	};
	const getDefaultLang = () => {
		return WCCON_BUILDER_ADMIN.languages[ 0 ].default;
	};

	const handleClickFilters = ( event ) => {
		setAnchorElQuery( event.currentTarget );
	};
	const handleCloseQuery = () => {
		setAnchorElQuery( null );
	};

	const openQueryModal = () => {
		setOpenedQuery( true );
	};
	const closeQueryModal = () => {
		setOpenedQuery( false );
	};
	const allQueryItems = [
		{
			id: 'product_tax',
			title: __( 'Product taxonomy', 'wccontour' ),
		},
		{
			id: 'product_meta',
			title: __( 'Product meta', 'wccontour' ),
		},
		{
			id: 'product_list',
			title: __( 'Product list', 'wccontour' ),
		},
	];
	const handleQueryItems = ( qId, componentSlug ) => {
		const queryTitle = allQueryItems.find( ( it ) => it.id === qId );
		const newQuery = {
			groupId: qId,
			title: queryTitle.title,
			value: '',
			relation: 'OR',
			nextRelation: 'OR',
		};
		if ( qId === 'product_meta' ) {
			newQuery.meta_value = '';
		}
		if ( qId === 'product_list' ) {
			newQuery.include = '';
			newQuery.exclude = '';
		}
		const newProductQuery = [
			...( component.meta.hasOwnProperty( 'product_query' ) ? component.meta.product_query : [] ),
			newQuery,
		];
		//console.log( qId, componentSlug );
		changeMetaValue( 'product_query', newProductQuery, activeShortcode.groups, component.slug, ( data ) => {
			//console.log( data );
			setActiveShortcode( { ...activeShortcode, groups: data } );
		} );
		handleCloseQuery();
	};

	const promiseOptions = ( inputValue: string, callback ) => {
		new Promise( ( resolve ) => {
			const formData = new FormData();

			formData.append( 'action', 'wccon_all_product_tax' );
			formData.append( 'nonce', WCCON_BUILDER_ADMIN.nonce );
			formData.append( 'field', inputValue );
			formData.append( 'all', true );
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
	const handleChangeAsyncSelect = ( val, queryIndex ) => {
		//console.log( 'VLA', val );
		const valiIds = val.map( ( v ) => v.value );
		const newProductQuery = component.meta.product_query.map( ( q, index ) => {
			if ( index === queryIndex ) {
				return { ...q, value: valiIds };
			}
			return q;
		} );
		changeMetaValue( 'product_query', newProductQuery, activeShortcode.groups, component.slug, ( data ) => {
			setActiveShortcode( { ...activeShortcode, groups: data } );
		} );
	};

	const handleRelation = ( val, queryIndex ) => {
		const newProductQuery = component.meta.product_query.map( ( q, index ) => {
			if ( index === queryIndex ) {
				return { ...q, relation: val };
			}
			return q;
		} );
		changeMetaValue( 'product_query', newProductQuery, activeShortcode.groups, component.slug, ( data ) => {
			setActiveShortcode( { ...activeShortcode, groups: data } );
		} );
	};

	const handleRelationNext = ( val, queryIndex ) => {
		const newProductQuery = component.meta.product_query.map( ( q, index ) => {
			if ( index === queryIndex ) {
				return { ...q, nextRelation: val };
			}
			return q;
		} );
		changeMetaValue( 'product_query', newProductQuery, activeShortcode.groups, component.slug, ( data ) => {
			setActiveShortcode( { ...activeShortcode, groups: data } );
		} );
	};

	const handleChangeSelectMeta = ( e, queryIndex ) => {
		if ( e.target.value === '' ) return;

		const newProductQuery = component.meta.product_query.map( ( q, index ) => {
			if ( index === queryIndex ) {
				return { ...q, value: e.target.value };
			}
			return q;
		} );
		changeMetaValue( 'product_query', newProductQuery, activeShortcode.groups, component.slug, ( data ) => {
			setActiveShortcode( { ...activeShortcode, groups: data } );
		} );
	};

	const setMetaValue = ( e, queryIndex ) => {
		const newProductQuery = component.meta.product_query.map( ( q, index ) => {
			if ( index === queryIndex ) {
				return { ...q, meta_value: e.target.value };
			}
			return q;
		} );

		changeMetaValue( 'product_query', newProductQuery, activeShortcode.groups, component.slug, ( data ) => {
			setActiveShortcode( { ...activeShortcode, groups: data } );
		} );
	};

	const setProductIncludes = ( e, queryIndex ) => {
		const newProductQuery = component.meta.product_query.map( ( q, index ) => {
			if ( index === queryIndex ) {
				return { ...q, include: e.target.value };
			}
			return q;
		} );

		changeMetaValue( 'product_query', newProductQuery, activeShortcode.groups, component.slug, ( data ) => {
			setActiveShortcode( { ...activeShortcode, groups: data } );
		} );
	};

	const setProductExcludes = ( e, queryIndex ) => {
		const newProductQuery = component.meta.product_query.map( ( q, index ) => {
			if ( index === queryIndex ) {
				return { ...q, exclude: e.target.value };
			}
			return q;
		} );

		changeMetaValue( 'product_query', newProductQuery, activeShortcode.groups, component.slug, ( data ) => {
			setActiveShortcode( { ...activeShortcode, groups: data } );
		} );
	};

	const removeQuery = ( queryIndex ) => {
		const newProductQuery = component.meta.product_query.filter( ( q, index ) => {
			return queryIndex !== index;
		} );

		changeMetaValue( 'product_query', newProductQuery, activeShortcode.groups, component.slug, ( data ) => {
			setActiveShortcode( { ...activeShortcode, groups: data } );
		} );
	};

	return (
		<Box sx={ { mb: 1 } }>
			<Tooltip title={ __( 'Configure display products by query', 'wccontour' ) } placement="top">
				<Button
					variant="outlined"
					color="success"
					startIcon={ <StorageOutlinedIcon /> }
					onClick={ openQueryModal }
					sx={ { width: '100%' } }
				>
					{ __( 'Product Query', 'wccontour' ) }
				</Button>
			</Tooltip>

			<ProductQueryDialog onClose={ closeQueryModal } open={ openedQuery } fullWidth maxWidth="lg" scroll="body">
				<BootstrapDialogTitle onClose={ closeQueryModal }>
					{ __( 'Product Query', 'wccontour' ) }
				</BootstrapDialogTitle>
				<DialogContent dividers sx={ { overflow: 'visible' } }>
					<Box>
						<Button
							variant="outlined"
							aria-expanded={ openQuery ? 'true' : undefined }
							disableElevation
							startIcon={ <AddOutlinedIcon /> }
							endIcon={ <KeyboardArrowDownIcon /> }
							onClick={ handleClickFilters }
						>
							{ __( 'Add query', 'wccontour' ) }
						</Button>
						<Menu
							anchorEl={ anchorElQuery }
							open={ openQuery }
							onClose={ handleCloseQuery }
							PaperProps={ {
								elevation: 0,
								sx: {
									overflow: 'visible',
									filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
									mt: 1.5,
									'& .MuiAvatar-root': {
										width: 32,
										height: 32,
										ml: -0.5,
										mr: 1,
									},
									'&:before': {
										content: '""',
										display: 'block',
										position: 'absolute',
										top: 0,
										right: 14,
										width: 10,
										height: 10,
										bgcolor: 'background.paper',
										transform: 'translateY(-50%) rotate(45deg)',
										zIndex: 0,
									},
								},
							} }
							transformOrigin={ {
								horizontal: 'right',
								vertical: 'top',
							} }
							anchorOrigin={ {
								horizontal: 'right',
								vertical: 'bottom',
							} }
						>
							<MenuItem onClick={ () => handleQueryItems( 'product_tax', component.slug ) }>
								{ __( 'Product taxonomy', 'wccontour' ) }
							</MenuItem>

							<MenuItem onClick={ () => handleQueryItems( 'product_meta', component.slug ) }>
								{ __( 'Product meta', 'wccontour' ) }
							</MenuItem>

							<MenuItem onClick={ () => handleQueryItems( 'product_list', component.slug ) }>
								{ __( 'Products', 'wccontour' ) }
							</MenuItem>
						</Menu>
					</Box>

					{ component.meta.product_query?.map( ( query, queryIndex ) => {
						const isLastQuery = component.meta.product_query.length - 1 === queryIndex;
						const renderQuery = ( query ) => {
							switch ( query.groupId ) {
								case 'product_tax':
									return (
										<ProductQueryGroup isLastQuery={ isLastQuery }>
											<FormControl sx={ { width: 400 } } className="wccon-async-select">
												<AsyncSelect
													value={ formatSelectValue( query.value ) }
													isMulti
													cacheOptions
													loadOptions={ loadPromiseOptions }
													placeholder={ __( 'Type to search…', 'wccontour' ) }
													onChange={ ( val ) => handleChangeAsyncSelect( val, queryIndex ) }
													styles={ {
														input: ( baseStyles, state ) => ( {
															...baseStyles,
															height: '25px',
														} ),
													} }
												/>
											</FormControl>
											<ButtonGroup
												disableElevation
												variant="contained"
												color="productQuery"
												aria-label="Disabled elevation buttons"
												sx={ {
													'& .MuiButton-outlined': {
														background: '#fff',
														color: '#333',
													},
												} }
											>
												<Button
													variant={ query.relation === 'OR' ? 'contained' : 'outlined' }
													onClick={ () => handleRelation( 'OR', queryIndex ) }
												>
													OR
												</Button>
												<Button
													variant={ query.relation === 'AND' ? 'contained' : 'outlined' }
													onClick={ () => handleRelation( 'AND', queryIndex ) }
												>
													AND
												</Button>
											</ButtonGroup>

											{ typeof component.meta.product_query[ queryIndex + 1 ] !== 'undefined' && (
												<ButtonGroup
													disableElevation
													variant="contained"
													color="productQuery"
													aria-label="Disabled elevation buttons"
													sx={ {
														position: 'absolute',
														transform: 'translate(-50%, 50%)',
														bottom: 0,
														left: '50%',
														zIndex: 100,
														'& .MuiButton-outlined': {
															background: '#fff',
															color: '#333',
														},
														'& .MuiButton-outlined:hover': {
															background: '#fff',
														},
													} }
												>
													<Button
														variant={
															query.nextRelation === 'OR' ? 'contained' : 'outlined'
														}
														onClick={ () => handleRelationNext( 'OR', queryIndex ) }
													>
														OR
													</Button>
													<Button
														variant={
															query.nextRelation === 'AND' ? 'contained' : 'outlined'
														}
														onClick={ () => handleRelationNext( 'AND', queryIndex ) }
													>
														AND
													</Button>
												</ButtonGroup>
											) }
										</ProductQueryGroup>
									);
								case 'product_meta':
									return (
										<ProductQueryGroup isLastQuery={ isLastQuery }>
											<Box sx={ { display: 'flex', alignItems: 'start' } }>
												<FormControl sx={ { width: 300, mr: 2 } }>
													<InputLabel id={ `select-label-meta${ queryIndex }` }>
														{ __( 'Select meta', 'wccontour' ) }
													</InputLabel>
													<Select
														labelId={ `select-label-meta${ queryIndex }` }
														value={ query.value }
														onChange={ ( e ) => handleChangeSelectMeta( e, queryIndex ) }
														input={
															<OutlinedInput
																label={ __( 'Product meta', 'wccontour' ) }
															/>
														}
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
														{ WCCON_BUILDER_ADMIN.product_meta.map( ( component ) => (
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
												<FormControl>
													<TextField
														type="text"
														label={ __( 'Meta value', 'wccontour' ) }
														defaultValue={ query.meta_value }
														onBlur={ ( e ) => {
															setMetaValue( e, queryIndex );
														} }
													/>
													<FormHelperText>
														{ __( '(leave blank for all values)', 'wccontour' ) }
													</FormHelperText>
												</FormControl>
											</Box>
											{ typeof component.meta.product_query[ queryIndex + 1 ] !== 'undefined' && (
												<ButtonGroup
													disableElevation
													variant="contained"
													color="productQuery"
													aria-label="Disabled elevation buttons"
													sx={ {
														position: 'absolute',
														transform: 'translate(-50%, 50%)',
														bottom: 0,
														left: '50%',
														zIndex: 100,
														'& .MuiButton-outlined': {
															background: '#fff',
															color: '#333',
														},
														'& .MuiButton-outlined:hover': {
															background: '#fff',
														},
													} }
												>
													<Button
														variant={
															query.nextRelation === 'OR' ? 'contained' : 'outlined'
														}
														onClick={ () => handleRelationNext( 'OR', queryIndex ) }
													>
														OR
													</Button>
													<Button
														variant={
															query.nextRelation === 'AND' ? 'contained' : 'outlined'
														}
														onClick={ () => handleRelationNext( 'AND', queryIndex ) }
													>
														AND
													</Button>
												</ButtonGroup>
											) }
										</ProductQueryGroup>
									);
								case 'product_list':
									return (
										<ProductQueryGroup isLastQuery={ isLastQuery }>
											<Box>
												<FormControl>
													<TextField
														type="text"
														label={ __( 'Include', 'wccontour' ) }
														defaultValue={ query.include }
														onBlur={ ( e ) => {
															setProductIncludes( e, queryIndex );
														} }
														sx={ { mr: 2 } }
													/>
													<FormHelperText>
														{ __( '(ids, separated by comma)', 'wccontour' ) }
													</FormHelperText>
												</FormControl>
												<FormControl>
													<TextField
														type="text"
														label={ __( 'Exclude', 'wccontour' ) }
														defaultValue={ query.exclude }
														onBlur={ ( e ) => {
															setProductExcludes( e, queryIndex );
														} }
													/>
													<FormHelperText>
														{ __( '(ids, separated by comma)', 'wccontour' ) }
													</FormHelperText>
												</FormControl>
											</Box>
											{ typeof component.meta.product_query[ queryIndex + 1 ] !== 'undefined' && (
												<ButtonGroup
													disableElevation
													variant="contained"
													aria-label="Disabled elevation buttons"
													color="productQuery"
													sx={ {
														position: 'absolute',
														transform: 'translate(-50%, 50%)',
														bottom: 0,
														left: '50%',
														zIndex: 100,
														'& .MuiButton-outlined': {
															background: '#fff',
															color: '#333',
														},
														'& .MuiButton-outlined:hover': {
															background: '#fff',
														},
													} }
												>
													<Button
														variant={
															query.nextRelation === 'OR' ? 'contained' : 'outlined'
														}
														onClick={ () => handleRelationNext( 'OR', queryIndex ) }
													>
														OR
													</Button>
													<Button
														variant={
															query.nextRelation === 'AND' ? 'contained' : 'outlined'
														}
														onClick={ () => handleRelationNext( 'AND', queryIndex ) }
													>
														AND
													</Button>
												</ButtonGroup>
											) }
										</ProductQueryGroup>
									);
							}
						};
						return (
							<ProductQueryRow key={ `query-${ queryIndex }` }>
								<Box>
									<Box
										sx={ {
											display: 'inline-flex',
											alignItems: 'center',
											columnGap: '8px',
											backgroundColor: '#bbdefb',
											borderRadius: '20px',
											paddingRight: '20px',
											marginTop: '10px',
											marginBottom: '10px',
										} }
									>
										<IconButton
											color="error"
											className="wccon-button-remove"
											onClick={ () => removeQuery( queryIndex, component.slug ) }
											sx={ {
												backgroundColor: '#ff8a80',
												'&:hover': {
													backgroundColor: '#f77f74',
												},
											} }
										>
											<CloseOutlinedIcon />
										</IconButton>
										<Typography variant="span" component="span">
											{ query.title }
										</Typography>
									</Box>
								</Box>
								{ renderQuery( query ) }
							</ProductQueryRow>
						);
					} ) }
				</DialogContent>
				<DialogActions>
					<Button variant="outlined" color="success" onClick={ closeQueryModal } sx={ { px: 3 } }>
						{ __( 'Save', 'wccontour' ) }
					</Button>
				</DialogActions>
			</ProductQueryDialog>
		</Box>
	);
} );

export default ProductQuery;
