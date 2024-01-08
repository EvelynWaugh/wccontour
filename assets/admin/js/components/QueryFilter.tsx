/**
 * External dependencies
 */

import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';

import { Droppable, Draggable } from 'react-beautiful-dnd';

import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';

import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';

import DeleteIcon from '@mui/icons-material/Delete';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import { Dialog, Tooltip } from '@mui/material';

import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import styled from '@emotion/styled';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

import FormHelperText from '@mui/material/FormHelperText';

/**
 * Internal dependencies
 */

import { changeWidgetValue, changeWidgetItem } from '../helpers/functions';
import { BootstrapDialogTitle, WidgetRow, WidgetRowInner } from '../styled-components/components';
const ExpandMore = styled( IconButton )`
	transform: ${ ( props ) => ( props.expand ? 'rotate(180deg)' : 'rotate(0deg)' ) };
`;

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: 48 * 4.5 + 8,
			width: 250,
		},
	},
};
const QueryFilter = ( props ) => {
	const { component, activeShortcode, setActiveShortcode } = props;
	const allFilterItems = applyFilters( 'wccontour-filter-items', [] );

	const [ openedFilters, setOpenedFilters ] = useState( false );
	const [ anchorElFilters, setAnchorElFilters ] = useState( null );
	const [ openedInnerWidget, setOpenedInnerWidget ] = useState( {} );
	const openWidgets = Boolean( anchorElFilters );
	const handleClickFilters = ( event ) => {
		setAnchorElFilters( event.currentTarget );
	};
	const handleCloseFilters = () => {
		setAnchorElFilters( null );
	};

	const openFilterModal = () => {
		setOpenedFilters( true );
	};
	const closeFilterModal = () => {
		setOpenedFilters( false );
	};
	const handleWidgetItems = ( fId, componentSlug ) => {
		const widgetTitle = allFilterItems.find( ( it ) => it.id === fId );
		const newWidget = {
			groupId: fId,
			title: widgetTitle.title,
			label: '',
			value: '',
		};
		if ( fId === 'product_tax' || fId === 'product_attribute' ) {
			newWidget.include = '';
			newWidget.exclude = '';
			newWidget.orderby = 'order';
		}
		if ( fId === 'product_tax' ) {
			newWidget.depth = 1;
			newWidget.show_children = false;
		}
		if ( fId === 'product_attribute' ) {
			newWidget.query_type = 'or';
		}
		if ( fId === 'product_meta' ) {
			newWidget.meta_value = '';
		}
		if ( fId === 'price' ) {
			newWidget.inputs = true;
		}
		//console.log( fId, componentSlug );
		changeWidgetValue( newWidget, activeShortcode.groups, componentSlug, ( data ) => {
			setActiveShortcode( { ...activeShortcode, groups: data } );
		} );
		handleCloseFilters();
	};

	const removeWidget = ( wIndex, componentSlug ) => {
		changeWidgetValue(
			wIndex,
			activeShortcode.groups,
			componentSlug,
			( data ) => {
				setActiveShortcode( { ...activeShortcode, groups: data } );
			},
			'remove'
		);
	};

	return (
		<Box>
			<Tooltip title={ __( 'Configure frontend widgets', 'wccontour' ) } placement="top">
				<Button
					variant="outlined"
					color="success"
					startIcon={ <FilterAltOutlinedIcon /> }
					onClick={ openFilterModal }
				>
					{ __( 'Manage filters', 'wccontour' ) }
				</Button>
			</Tooltip>
			<Dialog onClose={ closeFilterModal } open={ openedFilters } fullWidth maxWidth="lg" scroll="body">
				<BootstrapDialogTitle onClose={ closeFilterModal }>
					{ __( 'Filter widgets', 'wccontour' ) }
				</BootstrapDialogTitle>
				<DialogContent dividers>
					<Box>
						<Button
							variant="outlined"
							aria-expanded={ openWidgets ? 'true' : undefined }
							disableElevation
							startIcon={ <AddOutlinedIcon /> }
							endIcon={ <KeyboardArrowDownIcon /> }
							onClick={ handleClickFilters }
							sx={ { mb: 2 } }
						>
							{ __( 'Add widget', 'wccontour' ) }
						</Button>
						<Menu
							anchorEl={ anchorElFilters }
							open={ openWidgets }
							onClose={ handleCloseFilters }
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
							{ allFilterItems.map( ( fitem, i ) => (
								<MenuItem
									key={ `filter-${ i }` }
									onClick={ () => handleWidgetItems( fitem.id, component.slug ) }
								>
									{ fitem.title }
								</MenuItem>
							) ) }
						</Menu>
					</Box>
					<Droppable droppableId="widget" type="WIDGETS">
						{ ( provided ) => (
							<div { ...provided.droppableProps } ref={ provided.innerRef }>
								{ component.widgets?.map( ( widget, widgetIndex ) => {
									const setWidgetRow = ( e, field ) => {
										const isCheckbox = e.target.type === 'checkbox';

										changeWidgetItem(
											widgetIndex,
											{
												[ field ]: isCheckbox ? e.target.checked : e.target.value,
											},
											activeShortcode.groups,
											component.slug,
											( data ) => {
												setActiveShortcode( {
													...activeShortcode,
													groups: data,
												} );
											}
										);
									};

									const renderWidget = ( widget ) => {
										switch ( widget.groupId ) {
											case 'price':
												return (
													<Box
														sx={ {
															display: 'flex',
															alignItems: 'center',
															columnGap: '10px',
															mt: '10px',
														} }
													>
														<FormControl>
															<TextField
																type="text"
																label={ __( 'Title', 'wccontour' ) }
																defaultValue={ widget.label }
																onBlur={ ( e ) => {
																	setWidgetRow( e, 'label' );
																} }
															/>
														</FormControl>
														<FormControl>
															<FormControlLabel
																control={
																	<Checkbox
																		checked={
																			widget.hasOwnProperty( 'inputs' )
																				? widget.inputs
																				: true
																		}
																		onChange={ ( e ) => {
																			setWidgetRow( e, 'inputs' );
																		} }
																	/>
																}
																label={ __( 'Show inputs', 'wccontour' ) }
															/>
														</FormControl>
													</Box>
												);
											case 'product_tax':
												return (
													<Box>
														<Box
															sx={ {
																display: 'flex',
																alignItems: 'center',
																columnGap: '10px',
																mt: '10px',
															} }
														>
															<FormControl>
																<TextField
																	type="text"
																	label={ __( 'Title', 'wccontour' ) }
																	defaultValue={ widget.label }
																	onBlur={ ( e ) => {
																		setWidgetRow( e, 'label' );
																	} }
																/>
															</FormControl>
															<FormControl
																sx={ {
																	width: '250px',
																} }
															>
																<InputLabel id="demo-simple-select-label">
																	{ __( 'Select', 'wccontour' ) }
																</InputLabel>
																<Select
																	labelId="demo-simple-select-label"
																	id="demo-simple-select"
																	value={ widget.value }
																	label={ __( 'Select', 'wccontour' ) }
																	onChange={ ( e ) => {
																		setWidgetRow( e, 'value' );
																	} }
																>
																	<MenuItem value="">
																		{ __( 'Select', 'wccontour' ) }
																	</MenuItem>
																	{ WCCON_BUILDER_ADMIN.product_tax.map(
																		( tax, taxIndex ) => (
																			<MenuItem
																				value={ tax.value }
																				key={ `tax-${ taxIndex }` }
																				disabled={ component.widgets.some(
																					( w ) => w.value === tax.value
																				) }
																			>
																				{ tax.label }
																			</MenuItem>
																		)
																	) }
																</Select>
															</FormControl>
															<FormControl>
																<FormControlLabel
																	control={
																		<Checkbox
																			checked={ widget.show_children }
																			onChange={ ( e ) => {
																				setWidgetRow( e, 'show_children' );
																			} }
																		/>
																	}
																	label={ __( 'Show children only', 'wccontour' ) }
																/>
															</FormControl>
														</Box>
														<Box
															sx={ {
																display: 'flex',
																alignItems: 'start',
																columnGap: '10px',
																mt: '10px',
															} }
														>
															<FormControl>
																<TextField
																	type="text"
																	label={ __( 'Include', 'wccontour' ) }
																	defaultValue={ widget.include }
																	onBlur={ ( e ) => {
																		setWidgetRow( e, 'include' );
																	} }
																/>
																<FormHelperText>
																	{ __( '(ids, separated by comma)', 'wccontour' ) }
																</FormHelperText>
															</FormControl>
															<FormControl>
																<TextField
																	type="text"
																	label={ __( 'Exclude', 'wccontour' ) }
																	defaultValue={ widget.exclude }
																	onBlur={ ( e ) => {
																		setWidgetRow( e, 'exclude' );
																	} }
																/>
																<FormHelperText>
																	{ __( '(ids, separated by comma)', 'wccontour' ) }
																</FormHelperText>
															</FormControl>
															<TextField
																type="number"
																label={ __( 'Depth', 'wccontour' ) }
																defaultValue={ widget.depth }
																onBlur={ ( e ) => {
																	setWidgetRow( e, 'depth' );
																} }
																InputProps={ {
																	inputProps: {
																		min: -1,
																	},
																} }
																sx={ {
																	width: '100px',
																} }
															/>
															<FormControl
																sx={ {
																	width: '250px',
																} }
															>
																<InputLabel
																	id={ `widget-orderby-label-${ widgetIndex }` }
																>
																	{ __( 'Orderby', 'wccontour' ) }
																</InputLabel>
																<Select
																	labelId={ `widget-orderby-label-${ widgetIndex }` }
																	id={ `widget-orderby-select-${ widgetIndex }` }
																	value={ widget.orderby }
																	label={ __( 'Orderby', 'wccontour' ) }
																	onChange={ ( e ) => {
																		setWidgetRow( e, 'orderby' );
																	} }
																>
																	<MenuItem value="order">
																		{ __( 'Category order', 'wccontour' ) }
																	</MenuItem>

																	<MenuItem value="name">
																		{ __( 'Name', 'wccontour' ) }
																	</MenuItem>
																</Select>
															</FormControl>
														</Box>
													</Box>
												);
											case 'product_attribute':
												return (
													<Box
														sx={ {
															display: 'flex',
															alignItems: 'center',
															columnGap: '10px',
															mt: '10px',
														} }
													>
														<FormControl>
															<TextField
																type="text"
																label={ __( 'Title', 'wccontour' ) }
																defaultValue={ widget.label }
																onBlur={ ( e ) => {
																	setWidgetRow( e, 'label' );
																} }
															/>
														</FormControl>
														<FormControl
															sx={ {
																width: '250px',
															} }
														>
															<InputLabel id={ `wccon-attr-select-${ widgetIndex }` }>
																{ __( 'Select', 'wccontour' ) }
															</InputLabel>
															<Select
																labelId={ `wccon-attr-select-${ widgetIndex }` }
																id={ `wccon-select-${ widgetIndex }` }
																value={ widget.value }
																label={ __( 'Select', 'wccontour' ) }
																onChange={ ( e ) => {
																	setWidgetRow( e, 'value' );
																} }
															>
																<MenuItem value="">
																	{ __( 'Select', 'wccontour' ) }
																</MenuItem>
																{ WCCON_BUILDER_ADMIN.product_attributes.map(
																	( tax, taxIndex ) => (
																		<MenuItem
																			value={ tax.value }
																			key={ `tax-${ taxIndex }` }
																			disabled={ component.widgets.some(
																				( w ) => w.value === tax.value
																			) }
																		>
																			{ tax.label }
																		</MenuItem>
																	)
																) }
															</Select>
														</FormControl>
													</Box>
												);
											case 'product_meta':
												return (
													<Box
														sx={ {
															display: 'flex',
															alignItems: 'start',
															columnGap: '10px',
															mt: '10px',
														} }
													>
														<FormControl>
															<TextField
																type="text"
																label={ __( 'Title', 'wccontour' ) }
																defaultValue={ widget.label }
																onBlur={ ( e ) => {
																	setWidgetRow( e, 'label' );
																} }
															/>
														</FormControl>
														<FormControl
															sx={ {
																width: 400,
															} }
														>
															<InputLabel id={ `select-label-meta${ widgetIndex }` }>
																{ __( 'Select meta', 'wccontour' ) }
															</InputLabel>
															<Select
																labelId={ `select-label-meta${ widgetIndex }` }
																value={ widget.value }
																onChange={ ( e ) => setWidgetRow( e, 'value' ) }
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
																{ WCCON_BUILDER_ADMIN.product_meta.map(
																	( component ) => (
																		<MenuItem
																			key={ component.value }
																			value={ component.value }
																			//   style={getStyles(name, personName, theme)}
																		>
																			{ component.label }
																		</MenuItem>
																	)
																) }
															</Select>
														</FormControl>
														<FormControl>
															<TextField
																type="text"
																label={ __( 'Meta Values', 'wccontour' ) }
																defaultValue={ widget.meta_value }
																onBlur={ ( e ) => {
																	setWidgetRow( e, 'meta_value' );
																} }
															/>
															<FormHelperText>
																{ __( '(separated by comma)', 'wccontour' ) }
															</FormHelperText>
														</FormControl>
													</Box>
												);
										}
									};
									return (
										<Draggable
											key={ `widget-${ widgetIndex }` }
											draggableId={ `widget&${ widgetIndex }&${ component.slug }` }
											index={ widgetIndex }
										>
											{ ( provided ) => (
												<WidgetRow
													// key={ `widget-${ widgetIndex }` }
													ref={ provided.innerRef }
													{ ...provided.draggableProps }
												>
													<WidgetRowInner>
														<span
															{ ...provided.dragHandleProps }
															style={ { height: '24px' } }
														>
															<MoreVertIcon />
														</span>
														<span>{ widget.title }</span>
														<IconButton
															color="wcerror"
															className="wccon-button-remove"
															onClick={ () =>
																removeWidget( widgetIndex, component.slug )
															}
															sx={ { ml: 'auto' } }
														>
															<DeleteIcon />
														</IconButton>
														<ExpandMore
															expand={
																openedInnerWidget.hasOwnProperty( widgetIndex )
																	? openedInnerWidget[ widgetIndex ]
																	: false
															}
															onClick={ () =>
																setOpenedInnerWidget( {
																	...openedInnerWidget,
																	[ widgetIndex ]: openedInnerWidget.hasOwnProperty(
																		widgetIndex
																	)
																		? ! openedInnerWidget[ widgetIndex ]
																		: true,
																} )
															}
														>
															<ExpandMoreIcon />
														</ExpandMore>
													</WidgetRowInner>
													<Collapse
														in={
															openedInnerWidget.hasOwnProperty( widgetIndex )
																? openedInnerWidget[ widgetIndex ]
																: false
														}
														timeout="auto"
														unmountOnExit
													>
														{ renderWidget( widget ) }
													</Collapse>
												</WidgetRow>
											) }
										</Draggable>
									);
								} ) }
								{ provided.placeholder }
							</div>
						) }
					</Droppable>
				</DialogContent>
				<DialogActions>
					<Button variant="outlined" color="success" onClick={ closeFilterModal }>
						{ __( 'Save', 'wccontour' ) }
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default QueryFilter;
