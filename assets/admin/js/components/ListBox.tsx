/**
 * External dependencies
 */

import { useState, createContext, useContext, memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { defaults } from 'lodash';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionActions from '@mui/material/AccordionActions';
import IconButton from '@mui/material/IconButton';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import CardContent from '@mui/material/CardContent';

import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import Domain from '@mui/icons-material/Domain';
import DomainAdd from '@mui/icons-material/DomainAdd';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { CardActions, Chip } from '@mui/material';
import { pink } from '@mui/material/colors';
/**
 * Internal dependencies
 */
import MetaFields from './MetaFields';
import QueryFilter from './QueryFilter';
import ProductQuery from './ProductQuery';
import { UploadContainer, AccordionHeaderInner, WCconButton } from '../styled-components/components';
import { getEmptyGroup, getEmptySubGroup, getEmptyComponent } from '../helpers/defaults';
import {
	getImageUrl,
	changeMainValue,
	changeSubComponent,
	changeWidgetValue,
	changeWidgetItem,
} from '../helpers/functions';

const ListBoxContext = createContext( {} );

export const ListItemGroup = ( { children, item, setActiveShortcode, activeShortcode, provided } ) => {
	const { handleChangeAcc, expanded, setExpanded } = useContext( ListBoxContext );

	// const memoizedDataForListBox = useMemo( () => {
	// 	return activeShortcode;
	// }, [ activeShortcode ] );
	// console.log( 'memoized group', memoizedDataForListBox );

	const addComponent = ( groupSlug ) => {
		const newGroups = activeShortcode.groups.map( ( group ) => {
			if ( group.slug === groupSlug ) {
				const position = group.components.length;
				return {
					...group,
					components: [ ...group.components, defaults( { position }, { ...getEmptyComponent() } ) ],
				};
			}
			return group;
		} );
		setActiveShortcode( {
			...activeShortcode,
			groups: newGroups,
		} );
	};

	const addSubGroup = ( groupSlug ) => {
		const newGroups = activeShortcode.groups.map( ( group ) => {
			if ( group.slug === groupSlug ) {
				const position = group.components.length;
				return {
					...group,
					components: [
						...group.components,
						defaults(
							{
								parent_id: group.slug,
								title: __( 'New SubGroup', 'wccontour' ),
								position,
							},
							{ ...getEmptySubGroup() }
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

	const deleteGroup = ( id: string ) => {
		setActiveShortcode( {
			...activeShortcode,
			groups: activeShortcode.groups.filter( ( g ) => g.slug !== id ),
		} );
	};
	const setGroupTitle = ( e, groupSlug ) => {
		const newData = activeShortcode.groups.map( ( group ) => {
			if ( group.slug === groupSlug ) {
				return { ...group, title: e.target.value };
			}

			return group;
		} );
		setActiveShortcode( {
			...activeShortcode,
			groups: newData,
		} );
	};

	return (
		<Accordion
			expanded={ expanded.hasOwnProperty( item.slug ) ? expanded[ item.slug ] : false }
			onChange={ handleChangeAcc( item.slug ) }
			ref={ provided.innerRef }
			{ ...provided.draggableProps }
		>
			<AccordionSummary
				expandIcon={ <ExpandMoreIcon /> }
				aria-controls="panel1a-content"
				sx={ { '& .MuiAccordionSummary-content': { alignItems: 'center' } } }
				id={ `panel1a-header-${ item.slug }` }
				{ ...provided.dragHandleProps }
			>
				<Typography>{ item.title }</Typography>
				<Chip
					sx={ {
						backgroundColor: pink[ 900 ],
						color: '#fff',
						ml: 4,
						px: 3,
						py: 1,
						'& .MuiChip-icon': {
							color: '#fff',
						},
					} }
					icon={ <AccountBalanceIcon /> }
					label={ __( 'Group', 'wccontour' ) }
				/>
			</AccordionSummary>
			<AccordionDetails>
				<Box sx={ { display: 'flex', alignItems: 'center', mb: 2 } }>
					<FormControl sx={ { mt: 2 } }>
						<TextField
							type="text"
							label={ __( 'Group name', 'wccontour' ) }
							// value={ item.title }
							defaultValue={ item.title }
							onBlur={ ( e ) => setGroupTitle( e, item.slug ) }
						/>
					</FormControl>
					<WCconButton
						variant="contained"
						color="error"
						onClick={ () => addComponent( item.slug ) }
						sx={ { ml: 'auto', mr: 2 } }
						bgColor={ pink[ 400 ] }
						hoverBgColor={ pink[ 600 ] }
					>
						{ __( 'Add Component', 'wccontour' ) }
					</WCconButton>
					<WCconButton
						variant="contained"
						color="error"
						onClick={ () => addSubGroup( item.slug ) }
						bgColor={ pink[ 700 ] }
						hoverBgColor={ pink[ 900 ] }
					>
						{ __( 'Add SubGroup', 'wccontour' ) }
					</WCconButton>
				</Box>
				<Box>
					<MetaFields
						component={ item }
						activeShortcode={ activeShortcode }
						setActiveShortcode={ setActiveShortcode }
					/>
				</Box>

				{ item.components.length > 0 && (
					<Typography component="h4" variant="h4" sx={ { padding: '10px 0' } }>
						{ __( 'Components:', 'wccontour' ) }
					</Typography>
				) }

				<Droppable droppableId={ `group-${ item.slug }` } type={ `GROUPC-${ item.slug }` }>
					{ ( provided ) => (
						<div { ...provided.droppableProps } ref={ provided.innerRef }>
							{ children }
							{ provided.placeholder }
						</div>
					) }
				</Droppable>
			</AccordionDetails>
			<AccordionActions sx={ { justifyContent: 'space-between' } }>
				<Button variant="contained" color="wcerror" onClick={ () => deleteGroup( item.slug ) }>
					{ __( 'Remove Group', 'wccontour' ) }
				</Button>
			</AccordionActions>
		</Accordion>
	);
};
export const ListItemSubGroup = ( { children, item, setActiveShortcode, activeShortcode, provided } ) => {
	const { handleChangeAcc, expanded, setExpanded } = useContext( ListBoxContext );

	// const memoizedDataForListBox = useMemo( () => {
	// 	return activeShortcode;
	// }, [ activeShortcode ] );
	// console.log( 'memoized subgroup', memoizedDataForListBox );

	const addComponent = ( groupSlug ) => {
		changeSubComponent(
			'components',
			getEmptyComponent(),
			activeShortcode.groups,
			groupSlug,
			( data ) => {
				setActiveShortcode( { ...activeShortcode, groups: data } );
			},
			'add'
		);
	};
	const setGroupTitle = ( e, componentSlug ) => {
		const value = e.target.value;
		changeMainValue( 'title', value, activeShortcode.groups, componentSlug, ( data ) => {
			setActiveShortcode( { ...activeShortcode, groups: data } );
		} );
	};
	let frame;
	const setComponentImage = ( componentSlug ) => {
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
			const attachment = frame.state().get( 'selection' ).first().toJSON();

			changeMainValue( 'image_id', attachment.id, activeShortcode.groups, componentSlug, ( data ) => {
				setActiveShortcode( { ...activeShortcode, groups: data } );
			} );
		} );

		frame.open();
	};
	const removeComponentImage = ( componentSlug ) => {
		changeMainValue( 'image_id', 0, activeShortcode.groups, componentSlug, ( data ) => {
			setActiveShortcode( { ...activeShortcode, groups: data } );
		} );
	};
	const deleteGroup = ( componentSlug ) => {
		// setActiveShortcode( {
		// 	...activeShortcode,
		// 	groups: activeShortcode.groups.filter( ( g ) => g.slug !== id ),
		// } );

		changeSubComponent(
			'components',
			componentSlug,
			activeShortcode.groups,
			componentSlug,
			( data ) => {
				setActiveShortcode( { ...activeShortcode, groups: data } );
			},
			'remove'
		);
	};
	return (
		<Accordion
			expanded={ expanded.hasOwnProperty( item.slug ) ? expanded[ item.slug ] : false }
			onChange={ handleChangeAcc( item.slug ) }
			ref={ provided.innerRef }
			{ ...provided.draggableProps }
		>
			<AccordionSummary
				expandIcon={ <ExpandMoreIcon /> }
				aria-controls="panel1a-content"
				sx={ { '& .MuiAccordionSummary-content': { alignItems: 'center' } } }
				id={ `panel1a-header-${ item.slug }` }
				{ ...provided.dragHandleProps }
			>
				<Typography>{ item.title }</Typography>
				<Chip
					sx={ {
						backgroundColor: pink[ 700 ],
						color: '#fff',
						ml: 4,
						px: 3,
						py: 1,
						'& .MuiChip-icon': {
							color: '#fff',
						},
					} }
					icon={ <DomainAdd /> }
					label={ __( 'SubGroup', 'wccontour' ) }
				/>
			</AccordionSummary>
			<AccordionDetails>
				<Box sx={ { display: 'flex', alignItems: 'center', mb: 2 } }>
					<FormControl sx={ { mt: 2 } }>
						<TextField
							type="text"
							label={ __( 'Group name', 'wccontour' ) }
							defaultValue={ item.title }
							onBlur={ ( e ) => setGroupTitle( e, item.slug ) }
						/>
					</FormControl>
					<WCconButton
						variant="contained"
						color="error"
						sx={ { ml: 'auto' } }
						onClick={ () => addComponent( item.slug ) }
						bgColor={ pink[ 400 ] }
						hoverBgColor={ pink[ 600 ] }
					>
						{ __( 'Add Component', 'wccontour' ) }
					</WCconButton>
				</Box>

				<Box>
					<Box sx={ { display: 'flex' } }>
						<UploadContainer isUpload onClick={ () => setComponentImage( item.slug ) }>
							<UploadIcon />
						</UploadContainer>
						{ getImageUrl( item.image_id ) && (
							<UploadContainer>
								<img
									src={ getImageUrl( item.image_id ) }
									style={ {
										maxWidth: '100%',
										height: '100%',
										margin: '0 auto',
										display: 'block',
									} }
									alt=""
								/>
								<IconButton
									color="secondary"
									className="delete-gallery"
									onClick={ () => removeComponentImage( item.slug ) }
								>
									<DeleteIcon />
								</IconButton>
							</UploadContainer>
						) }
					</Box>

					<MetaFields
						component={ item }
						activeShortcode={ activeShortcode }
						setActiveShortcode={ setActiveShortcode }
					/>
				</Box>
				{ item.components.length > 0 && (
					<Typography component="h4" variant="h4" sx={ { padding: '10px 0' } }>
						{ __( 'Components:', 'wccontour' ) }
					</Typography>
				) }

				<Droppable droppableId={ `group-${ item.slug }` } type={ `SUBGROUP-${ item.slug }` }>
					{ ( provided ) => (
						<div { ...provided.droppableProps } ref={ provided.innerRef }>
							{ children }
							{ provided.placeholder }
						</div>
					) }
				</Droppable>
			</AccordionDetails>
			<AccordionActions sx={ { justifyContent: 'space-between' } }>
				<Button variant="contained" color="wcerror" onClick={ () => deleteGroup( item.slug ) }>
					{ __( 'Remove SubGroup', 'wccontour' ) }
				</Button>
			</AccordionActions>
		</Accordion>
	);
};
export const ListItemComponent = ( { item, setActiveShortcode, activeShortcode, provided } ) => {
	const { handleChangeAcc, expanded, setExpanded } = useContext( ListBoxContext );

	// const memoizedDataForListBox = useMemo( () => {
	// 	return activeShortcode;
	// }, [ activeShortcode ] );
	// console.log( 'memoized component', memoizedDataForListBox );

	const setComponentTitle = ( e, componentSlug ) => {
		const value = e.target.value;
		changeMainValue( 'title', value, activeShortcode.groups, componentSlug, ( data ) => {
			setActiveShortcode( { ...activeShortcode, groups: data } );
		} );
	};
	let frame;
	const setComponentImage = ( componentSlug ) => {
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
			const attachment = frame.state().get( 'selection' ).first().toJSON();

			changeMainValue( 'image_id', attachment.id, activeShortcode.groups, componentSlug, ( data ) => {
				setActiveShortcode( { ...activeShortcode, groups: data } );
			} );
		} );

		frame.open();
	};
	const removeComponentImage = ( componentSlug ) => {
		changeMainValue( 'image_id', 0, activeShortcode.groups, componentSlug, ( data ) => {
			setActiveShortcode( { ...activeShortcode, groups: data } );
		} );
	};
	const removeComponent = ( componentSlug ) => {
		changeSubComponent(
			'components',
			componentSlug,
			activeShortcode.groups,
			componentSlug,
			( data ) => {
				//console.log( data );
				setActiveShortcode( { ...activeShortcode, groups: data } );
			},
			'remove'
		);
	};

	return (
		<Accordion
			expanded={ expanded.hasOwnProperty( item.slug ) ? expanded[ item.slug ] : false }
			onChange={ handleChangeAcc( item.slug ) }
			ref={ provided.innerRef }
			{ ...provided.draggableProps }
		>
			<AccordionSummary
				expandIcon={ <ExpandMoreIcon /> }
				aria-controls="panel1a-content"
				sx={ { '& .MuiAccordionSummary-content': { alignItems: 'center' } } }
				id={ `panel1a-header-${ item.slug }` }
				{ ...provided.dragHandleProps }
			>
				<Typography>{ item.title }</Typography>
				<Chip
					sx={ {
						backgroundColor: pink[ 400 ],
						color: '#fff',
						ml: 4,
						px: 3,
						py: 1,
						'& .MuiChip-icon': {
							color: '#fff',
						},
					} }
					icon={ <Domain /> }
					label={ __( 'Component', 'wccontour' ) }
				/>
			</AccordionSummary>
			<AccordionDetails sx={ { padding: 0 } }>
				<Card sx={ { boxShadow: 'none' } }>
					<CardHeader
						title={
							<FormControl sx={ { mb: 2 } }>
								<TextField
									type="text"
									label={ __( 'Name', 'wccontour' ) }
									defaultValue={ item.title }
									onBlur={ ( e ) => setComponentTitle( e, item.slug ) }
								/>
							</FormControl>
						}
						action={
							<div>
								<ProductQuery
									component={ item }
									activeShortcode={ activeShortcode }
									setActiveShortcode={ setActiveShortcode }
								/>
								<QueryFilter
									component={ item }
									activeShortcode={ activeShortcode }
									setActiveShortcode={ setActiveShortcode }
								/>
							</div>
						}
					></CardHeader>
					<CardContent>
						<Box sx={ { display: 'flex', alignItems: 'flex-start' } }>
							<UploadContainer isUpload onClick={ () => setComponentImage( item.slug ) }>
								<UploadIcon />
							</UploadContainer>
							{ getImageUrl( item.image_id ) && (
								<UploadContainer>
									<img
										src={ getImageUrl( item.image_id ) }
										style={ {
											maxWidth: '100%',
											height: '100%',
											margin: '0 auto',
											display: 'block',
										} }
										alt=""
									/>
									<IconButton
										color="secondary"
										className="delete-gallery"
										onClick={ () => removeComponentImage( item.slug ) }
									>
										<DeleteIcon />
									</IconButton>
								</UploadContainer>
							) }
						</Box>

						<MetaFields
							component={ item }
							activeShortcode={ activeShortcode }
							setActiveShortcode={ setActiveShortcode }
						/>
					</CardContent>
					<CardActions>
						<Button variant="contained" color="wcerror" onClick={ () => removeComponent( item.slug ) }>
							{ __( 'Remove Component', 'wccontour' ) }
						</Button>
					</CardActions>
				</Card>
			</AccordionDetails>
		</Accordion>
	);
};

export const ListBox = memo( ( { children, setActiveShortcode, activeShortcode } ) => {
	const [ expanded, setExpanded ] = useState( {} );

	const handleChangeAcc = ( id ) => ( event, newExpanded ) => {
		// console.log(id, event, newExpanded);
		setExpanded( newExpanded ? { ...expanded, [ id ]: true } : { ...expanded, [ id ]: false } );
	};

	const onDragEnd = ( result ) => {
		if ( result.destination === null ) {
			return;
		}
		//console.log( result );
		if ( result.type === 'GROUP' ) {
			const newItems = [ ...activeShortcode.groups ];
			const [ reorderedItem ] = newItems.splice( result.source.index, 1 );

			newItems.splice( result.destination.index, 0, reorderedItem );
			const addPositionItems = newItems.map( ( g, i ) => ( {
				...g,
				position: i,
			} ) );
			setActiveShortcode( {
				...activeShortcode,
				groups: addPositionItems,
			} );
		}
		if ( /^GROUPC-/.test( result.type ) ) {
			const groupId = result.source.droppableId.replace( 'group-', '' );
			const newGroups = activeShortcode.groups.map( ( group ) => {
				if ( group.slug === groupId ) {
					const newItems = [ ...group.components ];
					const [ reorderedItem ] = newItems.splice( result.source.index, 1 );

					newItems.splice( result.destination.index, 0, reorderedItem );
					const addPositionItems = newItems.map( ( c, i ) => ( {
						...c,
						position: i,
					} ) );
					return { ...group, components: addPositionItems };
				}
				return group;
			} );
			setActiveShortcode( {
				...activeShortcode,
				groups: newGroups,
			} );
		}
		if ( /^SUBGROUP-/.test( result.type ) ) {
			const groupId = result.source.droppableId.replace( 'group-', '' );
			const newGroups = activeShortcode.groups.map( ( group ) => {
				const groupComponents = group.components.map( ( gc ) => {
					if ( gc.slug === groupId ) {
						const newItems = [ ...gc.components ];
						const [ reorderedItem ] = newItems.splice( result.source.index, 1 );

						newItems.splice( result.destination.index, 0, reorderedItem );
						const addPositionItems = newItems.map( ( c, i ) => ( {
							...c,
							position: i,
						} ) );
						return { ...gc, components: addPositionItems };
					}
					return gc;
				} );

				return { ...group, components: groupComponents };
			} );
			setActiveShortcode( {
				...activeShortcode,
				groups: newGroups,
			} );
		}

		if ( 'WIDGETS' === result.type ) {
			const droppablePieces = result.draggableId.split( '&' );

			const widgetIndex = droppablePieces[ 1 ];
			const componentId = droppablePieces[ 2 ];

			function rearrangeWidgets( data ) {
				return data.map( ( group ) => {
					if ( group.slug !== componentId ) {
						if ( group.hasOwnProperty( 'components' ) ) {
							return {
								...group,
								components: rearrangeWidgets( group.components ),
							};
						}
						return group;
					}

					const newItems = [ ...group.widgets ];

					const [ reorderedItem ] = newItems.splice( result.source.index, 1 );

					newItems.splice( result.destination.index, 0, reorderedItem );

					return { ...group, widgets: newItems };
				} );
			}
			const newGroups = rearrangeWidgets( activeShortcode.groups );

			setActiveShortcode( {
				...activeShortcode,
				groups: newGroups,
			} );
		}
	};

	const renderList = ( item, index ) => {
		if ( item.components && parseInt( item.parent_id, 10 ) === 0 ) {
			return (
				<Draggable
					key={ `component-${ item.slug }` }
					draggableId={ `component-${ item.slug }` }
					index={ index }
				>
					{ ( provided ) => (
						<ListItemGroup
							item={ item }
							activeShortcode={ activeShortcode }
							setActiveShortcode={ setActiveShortcode }
							provided={ provided }
						>
							{ item.components.map( ( component, index ) => renderList( component, index ) ) }
						</ListItemGroup>
					) }
				</Draggable>
			);
		} else if ( item.components && parseInt( item.parent_id, 10 ) !== 0 ) {
			return (
				<Draggable
					key={ `component-${ item.slug }` }
					draggableId={ `component-${ item.slug }` }
					index={ index }
				>
					{ ( provided ) => (
						<ListItemSubGroup
							item={ item }
							activeShortcode={ activeShortcode }
							setActiveShortcode={ setActiveShortcode }
							provided={ provided }
						>
							{ item.components.map( ( component, index ) => renderList( component, index ) ) }
						</ListItemSubGroup>
					) }
				</Draggable>

				// <ListItemSubGroup
				// 	item={ item }
				// 	activeShortcode={ activeShortcode }
				// 	setActiveShortcode={ setActiveShortcode }
				// >
				// 	{ item.components.map( ( component ) =>
				// 		renderList( component, index )
				// 	) }
				// </ListItemSubGroup>
			);
		}
		return (
			<Draggable key={ `component-${ item.slug }` } draggableId={ `component-${ item.slug }` } index={ index }>
				{ ( provided ) => (
					<ListItemComponent
						item={ item }
						activeShortcode={ activeShortcode }
						setActiveShortcode={ setActiveShortcode }
						provided={ provided }
					/>
				) }
			</Draggable>
		);
	};

	return (
		<ListBoxContext.Provider value={ { expanded, setExpanded, handleChangeAcc } }>
			<Box className="wccon-group-wrapper" sx={ { mb: '60px' } }>
				<DragDropContext onDragEnd={ onDragEnd }>
					<Droppable droppableId="group" type="GROUP">
						{ ( provided ) => (
							<div { ...provided.droppableProps } ref={ provided.innerRef }>
								{ activeShortcode.groups.map( ( item, index ) => (
									<Box key={ `group-${ item.slug }` } sx={ { mb: '10px' } }>
										{ renderList( item, index ) }
									</Box>
								) ) }
								{ provided.placeholder }
							</div>
						) }
					</Droppable>
				</DragDropContext>
			</Box>
		</ListBoxContext.Provider>
	);
} );
