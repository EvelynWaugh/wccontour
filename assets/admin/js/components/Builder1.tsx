/**
 * External dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';

import { v4 as uuid } from 'uuid';
import { __ } from '@wordpress/i18n';
import { flatten, differenceBy, defaults } from 'lodash';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionActions from '@mui/material/AccordionActions';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';

import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Grid from '@mui/material/Grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';
import { List, ListItem, ListItemText, Tooltip } from '@mui/material';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
/**
 * Internal dependencies
 */
import MetaFields from './MetaFields';
import { getImageUrl } from '../helpers/functions';
import { UploadContainer, ShortCodeWrapper, ShortCodeNav, ShortCodeContent, IconButtonAdd, AccordionHeaderInner} from '../styled-components/components';
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: 48 * 4.5 + 8,
			width: 250,
		},
	},
};
const WCBuilder = ( props ) => {
	const [ shortcodes, setShortcodes ] = useState(
		WCCON_BUILDER_ADMIN.shortcodes || []
	);
	const [ activeShortcode, setActiveShortcode ] = useState(
		shortcodes.length > 0 ? shortcodes[ 0 ] : null
	);
	const shortCodesIds = shortcodes.map( ( s ) => s.id );
	const getRandomId = () => {
		const multiplyValue = shortcodes.length > 99 ? 1000 : 100;
		const randomValue = Math.floor( Math.random() * multiplyValue );
		if ( shortCodesIds.includes( randomValue ) ) {
			return getRandomId();
		}
		return randomValue;
	};
	// const allFieldTypes = applyFilters("wccontour-field-types", []);
	const emptyShortcode = {
		id: getRandomId(),
		title: 'New shortcode',
		type: 'builder',
		groups: [],
	};
	const emptyGroup = {
		id: 0,
		slug: uuid(),
		title: __( 'New Group', 'wc-contour' ),
		parent_id: 0,
		image_id: 0,
		components: [],
		meta: {
			description: '',
			required: false,
		},
	};
	const emptyComponent = {
		id: 0,
		slug: uuid(),
		title: __( 'New Component', 'wc-contour' ),
		image_id: 0,
		meta: {
			description: '',
			required: false,
		},
	};
	const [ expanded, setExpanded ] = useState( {} );

	const handleChangeAcc = ( id ) => ( event, newExpanded ) => {
		// console.log(id, event, newExpanded);
		setExpanded(
			newExpanded
				? { ...expanded, [ id ]: true }
				: { ...expanded, [ id ]: false }
		);
	};

	const [ expandEdit, setExpandEdit ] = useState( {} );
	const handleExpandEdit = ( id ) => {
		setExpandEdit( { ...expandEdit, [ id ]: ! expandEdit[ id ] } );
	};
	const addShortcode = () => {
		setShortcodes( [ ...shortcodes, { ...emptyShortcode } ] );
	};
	const selectShortcode = ( shortcode ) => {
		setActiveShortcode( shortcode );
	};
	const getShortCodeValue = () => {
		return `[wccon-builder id=${ activeShortcode.id } title="${ activeShortcode.title }"]`;
	};
	const changeTitle = ( e ) => {
		setActiveShortcode( { ...activeShortcode, title: e.target.value } );
	};
	const addGroup = () => {
		setActiveShortcode( {
			...activeShortcode,
			groups: [ ...activeShortcode.groups, emptyGroup ],
		} );
	};
	useEffect( () => {
		if ( ! activeShortcode ) {
			return;
		}
		const newShortcodes = shortcodes.map( ( s ) =>
			s.id === activeShortcode.id ? activeShortcode : s
		);
		setShortcodes( newShortcodes );
	}, [ activeShortcode ] );

	const deleteGroup = ( id: string ) => {
		setActiveShortcode( {
			...activeShortcode,
			groups: activeShortcode.groups.filter( ( g ) => g.id !== id ),
		} );
	};
	const addSubGroup = ( groupSlug ) => {
		const newGroups = activeShortcode.groups.map( ( group ) => {
			if ( group.slug === groupSlug ) {
				return {
					...group,
					components: [
						...group.components,
						defaults(
							{ parent_id: group.slug, title: __('New SubGroup') },
							{ ...emptyGroup }
						),
					],
				};
			}
			return group;
		} );
		setActiveShortcode( {
			...activeShortcode,
			groups: newGroups,
		} );
	};
	const addComponent = ( groupSlug ) => {
		const newGroups = activeShortcode.groups.map( ( group ) => {
			if ( group.slug === groupSlug ) {
				return {
					...group,
					components: [ ...group.components, emptyComponent ],
				};
			}
			return group;
		} );
		setActiveShortcode( {
			...activeShortcode,
			groups: newGroups,
		} );
	};
	const setComponentTitle = ( e, componentSlug, groupSlug ) => {
		const newGroups = activeShortcode.groups.map( ( group ) => {
			if ( group.slug === groupSlug ) {
				const newComponents = group.components.map( ( c ) => {
					if ( c.slug === componentSlug ) {
						return { ...c, title: e.target.value };
					}
					return c;
				} );
				return {
					...group,
					components: newComponents,
				};
			}
			return group;
		} );
		setActiveShortcode( {
			...activeShortcode,
			groups: newGroups,
		} );
	};
	let frame;
	const setComponentImage = ( componentSlug, groupSlug ) => {
		if ( frame ) {
			frame.open();
			return;
		}

		const mainImagestate = wp.media.controller.Library.extend( {
			defaults: defaults(
				{
					allowLocalEdits: true,
					displaySettings: true,
					filterable: 'all',
					displayUserSettings: true,

					multiple: false,
				},
				wp.media.controller.Library.prototype.defaults
			),
		} );
		frame = wp.media( {
			//   multiple: false,
			// library : { type : 'image' },
			states: [ new mainImagestate() ],
		} );

		frame.on( 'select', function () {
			const attachment = frame
				.state()
				.get( 'selection' )
				.first()
				.toJSON();
			const newGroups = activeShortcode.groups.map( ( group ) => {
				if ( group.slug === groupSlug ) {
					const newComponents = group.components.map( ( c ) => {
						if ( c.slug === componentSlug ) {
							return { ...c, image_id: attachment.id };
						}
						return c;
					} );
					return {
						...group,
						components: newComponents,
					};
				}
				return group;
			} );
			setActiveShortcode( {
				...activeShortcode,
				groups: newGroups,
			} );
		} );

		frame.open();
	};
	const removeComponentImage = ( componentSlug, groupSlug ) => {
		const newGroups = activeShortcode.groups.map( ( group ) => {
			if ( group.slug === groupSlug ) {
				const newComponents = group.components.map( ( c ) => {
					if ( c.slug === componentSlug ) {
						return { ...c, image_id: 0 };
					}
					return c;
				} );
				return {
					...group,
					components: newComponents,
				};
			}
			return group;
		} );
		setActiveShortcode( {
			...activeShortcode,
			groups: newGroups,
		} );
	};
	return (
		<ShortCodeWrapper>
			<input
				type="hidden"
				name="ev_pizza_shortcodes"
				value={ JSON.stringify( shortcodes ) }
			/>
			<ShortCodeNav>
				<List component="ul">
					{ shortcodes.map( ( shortcode ) => (
						<ListItem
							onClick={ () => selectShortcode( shortcode ) }
							divider
							button
						>
							<ListItemText primary={ shortcode.title } />
						</ListItem>
					) ) }
				</List>

				<Tooltip title={ __( 'Add shortcode' ) } placement="top">
					<IconButtonAdd
						color="inherit"
						size="large"
						onClick={ addShortcode }
					>
						<AddIcon />
					</IconButtonAdd>
				</Tooltip>
			</ShortCodeNav>
			{ activeShortcode ? (
				<ShortCodeContent>
					<Button
						variant="contained"
						color="error"
						onClick={ () => addGroup() }
					>
						{ __( 'Add Group' ) }
					</Button>
					<div
						style={ {
							padding: '15px',
							backgroundColor: 'cornsilk',
							color: 'cornflowerblue',
						} }
					>
						<Typography>
							{ __( `Your shortcode: ` ) }
							<span style={ { fontWeight: '700' } }>
								{ getShortCodeValue() }
							</span>
						</Typography>
					</div>
					<FormControl sx={ { mt: 3, flexDirection: 'row', mb: 3 } }>
						<TextField
							type="text"
							label="Title"
							value={ activeShortcode.title }
							onChange={ changeTitle }
							sx={ { mr: 3 } }
						/>
					</FormControl>

					{ activeShortcode.groups.map( ( group ) => (
						<Accordion
							expanded={
								expanded.hasOwnProperty( group.slug )
									? expanded[ group.slug ]
									: false
							}
							onChange={ handleChangeAcc( group.slug ) }
						>
							<AccordionSummary
								expandIcon={ <ExpandMoreIcon /> }
								aria-controls="panel1a-content"
								id={ `panel1a-header-${ group.slug }` }
							>
								<Typography>
									{ group.title !== ''
										? ' - ' + group.title
										: '' }
								</Typography>
							</AccordionSummary>
							<AccordionDetails>
								<AccordionHeaderInner>
									<FormControl sx={ { mt: 2 } }>
										<TextField
											type="text"
											label={ __( 'Group name' ) }
											value={ group.title }
											onChange={ ( e ) =>
												setGroupTitle( e, group.title )
											}
										/>
									</FormControl>
								</AccordionHeaderInner>
								<Button
									variant="contained"
									color="error"
									onClick={ () => addComponent( group.slug ) }
								>
									{ __( 'Add Component' ) }
								</Button>
								<Button
									variant="contained"
									color="error"
									onClick={ () => addSubGroup( group.slug ) }
								>
									{ __( 'Add SubGroup' ) }
								</Button>
								{ /* <FormControl sx={ { mt: 3, width: 400 } }>
									<InputLabel
										id={ `food-add-chip-label-${ c.step }` }
									>
										{ __(
											'Add components',
											'pizza-builder-for-woocommerce'
										) }
									</InputLabel>
									<Select
										labelId={ `food-add-chip-label-${ c.step }` }
										multiple
										value={ c.components.map(
											( component ) => component.id
										) }
										onChange={ ( e ) =>
											handleChangeComponents( e, c.step )
										}
										input={
											<OutlinedInput
												label={ __(
													'Add components',
													'pizza-builder-for-woocommerce'
												) }
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
												{ selected.map( ( value ) => {
													const foundLabel = flatten(
														pizzaComponents.map(
															( group ) =>
																group.components
														)
													).find( ( component ) => {
														return (
															component.id ===
															value
														);
													} );

													return (
														<Chip
															key={ value }
															label={
																foundLabel.name
															}
														/>
													);
												} ) }
											</Box>
										) }
										MenuProps={ MenuProps }
									>
										{ pizzaComponents.map( ( group ) => {
											return [
												<ListSubheader
													color="primary"
													sx={ {
														fontSize: '20px',
														fontWeight: 'bold',
													} }
												>
													{ group.groupName }
												</ListSubheader>,
												group.components.map(
													( component ) => {
														return (
															<MenuItem
																key={
																	component.id
																}
																value={
																	component.id
																}
																//   style={getStyles(name, personName, theme)}
															>
																{
																	component.name
																}
															</MenuItem>
														);
													}
												),
											];
										} ) }
									</Select>
								</FormControl> */ }

								{ group.components.length > 0 && (
									<Typography
										component="h4"
										variant="h4"
										sx={ { padding: '10px 0' } }
									>
										{ __(
											'Components:',
											'pizza-builder-for-woocommerce'
										) }
									</Typography>
								) }

								{ group.components.map( ( component ) => (
									// <div>
									// 	<Card>
									// 		<CardHeader
									// 			// action={
									// 			// 	<div>
									// 			// 		<IconButton
									// 			// 			aria-label="edit"
									// 			// 			color="secondary"
									// 			// 			onClick={ () =>
									// 			// 				handleExpandEdit(
									// 			// 					component.slug
									// 			// 				)
									// 			// 			}
									// 			// 		>
									// 			// 			<EditIcon />
									// 			// 		</IconButton>
									// 			// 	</div>
									// 			// }
									// 			title={ component.title }
									// 			subheader={
									// 				<span>Subheader</span>
									// 			}
									// 		></CardHeader>
									// 		<CardContent>
									// 			<FormControl>
									// 				<TextField
									// 					type="text"
									// 					label={ __( 'Name' ) }
									// 					value={
									// 						component.title
									// 					}
									// 					onChange={ ( e ) =>
									// 						setComponentTitle(
									// 							e,
									// 							component.slug,
									// 							group.slug
									// 						)
									// 					}
									// 				/>
									// 			</FormControl>
									// 			<UploadContainer
									// 				isUpload
									// 				onClick={ () =>
									// 					setComponentImage(
									// 						component.slug,
									// 						group.slug
									// 					)
									// 				}
									// 			>
									// 				<UploadIcon />
									// 			</UploadContainer>
									// 			{ getImageUrl(
									// 				component.image_id
									// 			) && (
									// 				<UploadContainer>
									// 					<img
									// 						src={ getImageUrl(
									// 							component.image_id
									// 						) }
									// 						style={ {
									// 							maxWidth:
									// 								'100%',
									// 							height: '100%',
									// 							margin: '0 auto',
									// 							display:
									// 								'block',
									// 						} }
									// 					/>
									// 					<IconButton
									// 						color="secondary"
									// 						className="delete-gallery"
									// 						onClick={ () =>
									// 							removeComponentImage(
									// 								component.slug,
									// 								group.slug
									// 							)
									// 						}
									// 					>
									// 						<DeleteIcon />
									// 					</IconButton>
									// 				</UploadContainer>
									// 			) }

									// 			<div
									// 				style={ { clear: 'both' } }
									// 			></div>
									// 			<MetaFields
									// 				component={ component }
									// 				activeShortcode={
									// 					activeShortcode
									// 				}
									// 				setActiveShortcode={
									// 					setActiveShortcode
									// 				}
									// 			/>

									// 			{ /* <CardMedia
									// 				component="img"
									// 				height="100"
									// 				image={ component.image_id }
									// 				alt=""
									// 			/> */ }
									// 		</CardContent>
									// 	</Card>
									// </div>
									
								) ) }
							</AccordionDetails>
							<AccordionActions
								sx={ { justifyContent: 'space-between' } }
							>
								<Button
									variant="contained"
									color="error"
									onClick={ () => deleteGroup( group.slug ) }
								>
									{ __( 'Delete Group' ) }
								</Button>
							</AccordionActions>
						</Accordion>
					) ) }
				</ShortCodeContent>
			) : (
				<ShortCodeContent>
					<Typography component="h4" variant="h4">
						{ __( 'Select shortcode' ) }
					</Typography>
				</ShortCodeContent>
			) }
		</ShortCodeWrapper>
	);
};

export default WCBuilder;
