/**
 * External dependencies
 */
import { useState, useEffect, forwardRef } from '@wordpress/element';

import { __ } from '@wordpress/i18n';
import { debounce, defaults, flattenDeep } from 'lodash';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';

import DeleteIcon from '@mui/icons-material/Delete';

import FormControl from '@mui/material/FormControl';

import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';

import { List, ListItem, ListItemButton, ListItemText, Tooltip } from '@mui/material';

import Select from '@mui/material/Select';

import Button from '@mui/material/Button';

import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';

import Dialog from '@mui/material/Dialog';

import DialogActions from '@mui/material/DialogActions';
import { pink } from '@mui/material/colors';
import AsyncSelect from 'react-select/async';
import Snackbar from '@mui/material/Snackbar';
import FormHelperText from '@mui/material/FormHelperText';

import MuiAlert from '@mui/material/Alert';
/**
 * Internal dependencies
 */
import '../helpers/field-types';

import { getRandomId, findElement } from '../helpers/functions';

import {
	UploadContainer,
	ShortCodeWrapper,
	ShortCodeNav,
	ShortCodeContent,
	IconButtonAdd,
	AccordionHeaderInner,
	BootstrapDialogTitle,
	WCconButton,
} from '../styled-components/components';
import { ListBox } from './ListBox';
import { getEmptyGroup } from '../helpers/defaults';

const Alert = ( props ) => {
	return <MuiAlert elevation={ 6 } severity={ props.type } variant="filled" { ...props } />;
};
const LangItem = forwardRef( function ( props, ref ) {
	return (
		<span ref={ ref } { ...props }>
			{ props.url && <img src={ props.url } alt={ __( 'Language', 'wccontour' ) } /> }
		</span>
	);
} );
const ListItemLang = ( { lang } ) => {
	if ( WCCON_BUILDER_ADMIN.languages && Array.isArray( WCCON_BUILDER_ADMIN.languages ) ) {
		let selectedLang;
		if ( ! lang ) {
			selectedLang = WCCON_BUILDER_ADMIN.languages.find( ( l ) => l.default === l.code );
		} else {
			selectedLang = WCCON_BUILDER_ADMIN.languages.find( ( l ) => lang === l.code );
		}
		let imageUrl = selectedLang.flag;
		if ( selectedLang.flag ) {
			const imgSrcRegex = /<img[^>]+src=['"]([^'"]+)['"][^>]*>/i;
			const match = selectedLang.flag.match( imgSrcRegex );
			if ( match ) {
				imageUrl = match[ 1 ];
			}
		}
		return (
			<Tooltip title={ selectedLang.name } placement="top">
				<LangItem url={ imageUrl } />
			</Tooltip>
		);
	}
	return <span></span>;
};
const WCBuilder = ( props ) => {
	const userPro = WCCON_BUILDER_ADMIN.pro ? true : false;

	let defaultShortcodes = WCCON_BUILDER_ADMIN.shortcodes || [];
	if ( ! userPro ) {
		defaultShortcodes = defaultShortcodes.slice( 0, 1 );
	}

	const [ shortcodes, setShortcodes ] = useState( defaultShortcodes );

	const [ activeShortcode, setActiveShortcode ] = useState( shortcodes.length > 0 ? shortcodes[ 0 ] : null );
	const [ loading, setLoading ] = useState( false );
	const [ openedRemoveData, setOpenedRemoveData ] = useState( false );
	const [ premiumDialog, setPremiumDialog ] = useState( false );
	const [ message, setMessage ] = useState( {
		opened: false,
		text: '',
		type: '',
	} );
	const [ message2, setMessage2 ] = useState( {
		opened: false,
		text: '',
		type: '',
	} );
	const emptyShortcode = {
		id: 0,
		shortcode_id: getRandomId( shortcodes ),
		title: 'New builder',
		page_id: '',
		lang: '',
		type: 'builder',
		groups: [],
	};

	const isMultiLang = () => {
		if ( WCCON_BUILDER_ADMIN.languages && Array.isArray( WCCON_BUILDER_ADMIN.languages ) ) {
			return true;
		}
		return false;
	};
	const getDefaultLang = () => {
		return WCCON_BUILDER_ADMIN.languages[ 0 ].default;
	};

	const addShortcode = () => {
		let clearList = false;
		if ( shortcodes.length === 0 ) {
			clearList = true;
		}
		if ( shortcodes.length && ! WCCON_BUILDER_ADMIN.pro ) {
			setPremiumDialog( true );
			return;
		}
		const newShortCodeEmpty = { ...emptyShortcode };
		setShortcodes( [ ...shortcodes, { ...newShortCodeEmpty } ] );

		if ( clearList ) {
			console.log( 'clear' );
			setActiveShortcode( newShortCodeEmpty );
		}
		//console.log( activeShortcode );
	};
	const selectShortcode = ( shortcode ) => {
		setActiveShortcode( shortcode );
	};
	const getShortCodeValue = () => {
		return `[wccon-builder id="${ activeShortcode.shortcode_id }" title="${ activeShortcode.title }"]`;
	};
	const changeTitle = ( e ) => {
		setActiveShortcode( { ...activeShortcode, title: e.target.value } );
	};

	const addGroup = () => {
		const position = activeShortcode.groups.length;
		setActiveShortcode( {
			...activeShortcode,
			groups: [ ...activeShortcode.groups, defaults( { position }, { ...getEmptyGroup() } ) ],
		} );
	};
	useEffect( () => {
		if ( ! activeShortcode ) {
			return;
		}
		//console.log( 'effect1' );
		const getAttachmentIds = ( data, results = [] ) => {
			const value = data.map( ( d ) => {
				if ( d.hasOwnProperty( 'components' ) && d.components.length ) {
					return getAttachmentIds( d.components, [ ...results, d.image_id ] );
				}
				return [ d.image_id, ...results ];
			} );

			return flattenDeep( value );
		};
		//console.log( getAttachmentIds( activeShortcode?.groups ) );
		wp.media
			.query( { post__in: getAttachmentIds( activeShortcode?.groups ) } )
			.more()
			.then( function () {} );
	}, [ activeShortcode?.id ] );
	useEffect( () => {
		if ( ! activeShortcode ) {
			return;
		}
		//console.log( 'effect2' );
		const newShortcodes = shortcodes.map( ( s ) =>
			s.shortcode_id === activeShortcode.shortcode_id ? activeShortcode : s
		);
		setShortcodes( newShortcodes );
	}, [ activeShortcode ] );

	const saveData = () => {
		setLoading( true );
		const formData = new FormData();
		const abortController = new AbortController();
		formData.append( 'action', 'wccon_save_builder' );
		// formData.append( 'action', 'test_wpml_wccon' );
		formData.append( 'data', JSON.stringify( activeShortcode ) );
		formData.append( 'nonce', WCCON_BUILDER_ADMIN.nonce );
		//console.log( activeShortcode );
		try {
			fetch( WCCON_BUILDER_ADMIN.ajax_url, {
				method: 'POST',
				body: formData,
				signal: abortController.signal,
			} )
				.then( ( response ) => {
					return response.json();
				} )
				.then( ( res ) => {
					//console.log( res );
					if ( res.success ) {
						setMessage( {
							opened: true,
							type: 'success',
							text: __( 'Saved!', 'wccontour' ),
						} );

						//update ids
						updateZeroIds( res.data.new_data );

						if ( ! res.data.data.page_id ) {
							setMessage2( {
								opened: true,
								type: 'warning',
								text: __( 'Select Associated page', 'wccontour' ),
							} );
						}
					} else {
						setMessage( {
							opened: true,
							type: 'error',
							text: __( 'Something went wrong', 'wccontour' ),
						} );
					}
					setLoading( false );
				} );
		} catch ( err ) {
			if ( ! abortController.signal.aborted ) {
				setLoading( false );
			}
			console.log( err );
		}
	};

	const removeData = () => {
		const formData = new FormData();
		const abortController = new AbortController();
		formData.append( 'action', 'wccon_remove_builder' );
		formData.append( 'id', activeShortcode.id );
		formData.append( 'nonce', WCCON_BUILDER_ADMIN.nonce );
		//console.log( activeShortcode );
		if ( activeShortcode.id !== 0 ) {
			try {
				fetch( WCCON_BUILDER_ADMIN.ajax_url, {
					method: 'POST',
					body: formData,
					signal: abortController.signal,
				} )
					.then( ( response ) => {
						return response.json();
					} )
					.then( ( res ) => {
						//console.log( res );
						if ( res.success ) {
							setMessage( {
								opened: true,
								type: 'success',
								text: __( 'Removed!', 'wccontour' ),
							} );
						} else {
							setMessage( {
								opened: true,
								type: 'error',
								text: __( 'Something went wrong. Try again.', 'wccontour' ),
							} );
						}
					} );
			} catch ( err ) {
				console.log( err );
			}
		}
		const newShortcodes = shortcodes.filter( ( sh ) => sh.shortcode_id !== activeShortcode.shortcode_id );
		setShortcodes( newShortcodes );
		if ( newShortcodes.length > 0 ) {
			setActiveShortcode( newShortcodes[ 0 ] );
		} else {
			setActiveShortcode( null );
		}
		setOpenedRemoveData( false );
	};

	const upgradePlan = () => {
		window.location.href = WCCON_BUILDER_ADMIN.pricing_url;
	};

	const promiseOptions = ( inputValue: string, callback ) => {
		new Promise( ( resolve ) => {
			const formData = new FormData();

			formData.append( 'action', 'wccon_all_pages' );
			formData.append( 'field', inputValue );
			formData.append( 'nonce', WCCON_BUILDER_ADMIN.nonce );
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
	const loadPromiseOptions = debounce( promiseOptions, 500 );
	const handleChangeAsyncSelect = ( val ) => {
		//console.log( val );
		let pageValue = val ? val.value : '';
		if ( val && typeof val.value !== 'undefined' && val.value !== '' ) {
			window.WCCON_BUILDER_ADMIN.displayed_pages.push( val );
		}

		setActiveShortcode( {
			...activeShortcode,
			page_id: pageValue,
		} );
	};
	const getPageIdValue = ( page_id ) => {
		const foundValue = WCCON_BUILDER_ADMIN.displayed_pages.find( ( p ) => p.value == page_id );
		//console.log( page_id, foundValue );
		if ( foundValue ) {
			return foundValue;
		}
		return null;
	};

	const handleChangeLanguage = ( e ) => {
		setActiveShortcode( {
			...activeShortcode,
			lang: e.target.value,
		} );
	};
	const handleChangeType = ( e ) => {
		setActiveShortcode( {
			...activeShortcode,
			type: e.target.value,
		} );
	};

	const updateZeroIds = ( newData ) => {
		const newGroups = activeShortcode.groups.map( ( group ) => {
			const foundGroup = findElement( newData.groups, group.slug );

			const newComponents = group.components.map( ( component ) => {
				const foundComponent = findElement( newData.groups, component.slug );

				if ( component.hasOwnProperty( 'components' ) ) {
					const newSubcomponents = component.components.map( ( subc ) => {
						const foundSubComponent = findElement( newData.groups, subc.slug );
						if ( foundSubComponent && parseInt( subc.id, 10 ) !== parseInt( foundSubComponent.id, 10 ) ) {
							return { ...subc, id: foundSubComponent.id };
						}
						return subc;
					} );

					if ( foundComponent && parseInt( component.id, 10 ) !== parseInt( foundComponent.id, 10 ) ) {
						return { ...component, id: foundComponent.id, components: newSubcomponents };
					}
					return { ...component, components: newSubcomponents };
				}

				if ( foundComponent && parseInt( component.id, 10 ) !== parseInt( foundComponent.id, 10 ) ) {
					return { ...component, id: foundComponent.id };
				}

				return component;
			} );

			if ( foundGroup && parseInt( group.id, 10 ) !== parseInt( foundGroup.id, 10 ) ) {
				return { ...group, id: foundGroup.id, components: newComponents };
			}
			return { ...group, components: newComponents };
		} );

		setActiveShortcode( {
			...activeShortcode,
			id: newData.id,
			groups: newGroups,
		} );
	};
	return (
		<Box>
			<ShortCodeWrapper>
				<ShortCodeNav>
					<List component="ul">
						{ shortcodes.map( ( shortcode ) => (
							<ListItem
								disablePadding
								divider
								key={ `builder-${ shortcode.shortcode_id }` }
								sx={ { pb: 1, mb: 1 } }
							>
								<ListItemButton
									selected={ activeShortcode?.shortcode_id == shortcode.shortcode_id }
									onClick={ () => selectShortcode( shortcode ) }
								>
									<ListItemText primary={ shortcode.title } />
									<ListItemLang lang={ shortcode.lang } />
								</ListItemButton>
							</ListItem>
						) ) }
					</List>

					<Tooltip title={ __( 'Add builder', 'wccontour' ) } placement="top">
						<IconButtonAdd color="inherit" size="large" onClick={ addShortcode }>
							<AddIcon />
						</IconButtonAdd>
					</Tooltip>
					{ ! userPro && (
						<Box sx={ { borderTop: '1px solid #ddd', pt: 1 } }>
							<FormHelperText sx={ { ml: 0, mb: 1 } }>
								<span>{ __( 'You are using FREE version,', 'wccontour' ) }</span>
								<br />
								<span>{ __( ' only 1 builder item available', 'wccontour' ) }</span>
							</FormHelperText>
							<WCconButton
								variant="contained"
								color="error"
								href={ WCCON_BUILDER_ADMIN.pricing_url }
								sx={ { '&:hover, &:focus': { color: '#fff' }, mr: 1 } }
								bgColor={ pink[ 400 ] }
								hoverBgColor={ pink[ 600 ] }
							>
								{ __( 'Upgrade to PRO', 'wccontour' ) }
							</WCconButton>
						</Box>
					) }
				</ShortCodeNav>
				{ activeShortcode ? (
					<ShortCodeContent>
						<div
							style={ {
								padding: '15px',
								backgroundColor: 'cornsilk',
								color: 'cornflowerblue',
							} }
						>
							<Typography>
								{ __( 'Your shortcode: ', 'wccontour' ) }
								<span style={ { fontWeight: '700' } }>{ getShortCodeValue() }</span>
							</Typography>
						</div>

						<FormControl sx={ { mt: 3, flexDirection: 'row', mb: 3 } }>
							<TextField
								type="text"
								label={ __( 'Title', 'wccontour' ) }
								value={ activeShortcode.title }
								onChange={ changeTitle }
								sx={ { mr: 3 } }
							/>
						</FormControl>
						{ isMultiLang() && (
							<>
								<FormControl sx={ { mt: 3, mb: 3, mr: 3 } }>
									<InputLabel>{ __( 'Language', 'wccontour' ) }</InputLabel>
									<Select
										value={ activeShortcode.lang ? activeShortcode.lang : getDefaultLang() }
										label={ __( 'Language', 'wccontour' ) }
										onChange={ handleChangeLanguage }
									>
										{ WCCON_BUILDER_ADMIN.languages.map( ( l ) => (
											<MenuItem value={ l.code } key={ l.code }>
												{ l.name }
											</MenuItem>
										) ) }
									</Select>
								</FormControl>
								<FormControl sx={ { mt: 3, mb: 3 } }>
									<TextField
										type="text"
										label={ __( 'Type', 'wccontour' ) }
										value={ activeShortcode.type }
										onChange={ handleChangeType }
									/>

									<FormHelperText>
										{ __( '(combine related builders by type)', 'wccontour' ) }
									</FormHelperText>
								</FormControl>
							</>
						) }
						<Box sx={ { display: 'flex', flexDirection: 'row', alignItems: 'center' } }>
							<InputLabel sx={ { position: 'relative', mr: 3 } }>
								{ __( 'Associated page:', 'wccontour' ) }
								<FormHelperText>{ __( '(default fo home)', 'wccontour' ) }</FormHelperText>
							</InputLabel>
							<FormControl sx={ { width: 400 } } className="wccon-async-select">
								<AsyncSelect
									value={ getPageIdValue( activeShortcode.page_id ) }
									cacheOptions
									isClearable
									loadOptions={ loadPromiseOptions }
									placeholder={ __( 'Type to search…', 'wccontour' ) }
									onChange={ ( val ) => handleChangeAsyncSelect( val ) }
									styles={ {
										control: ( baseStyles, state ) => ( {
											...baseStyles,
											height: '56px',
										} ),
										valueContainer: ( baseStyles, state ) => ( {
											...baseStyles,
											height: '56px',
										} ),
										indicatorsContainer: ( baseStyles, state ) => ( {
											...baseStyles,
											height: '56px',
										} ),
										input: ( baseStyles, state ) => ( {
											...baseStyles,
											margin: '0px',
											padding: '0px',
										} ),
									} }
								/>
								<FormHelperText>
									{ __(
										'Important: for applying styles, building share links and more',
										'wccontour'
									) }
								</FormHelperText>
							</FormControl>
						</Box>

						<WCconButton
							variant="contained"
							color="error"
							onClick={ () => addGroup() }
							sx={ {
								display: 'flex',
								mb: 2,
							} }
							bgColor={ pink[ 900 ] }
							hoverBgColor={ '#600435' }
						>
							{ __( 'Add Group', 'wccontour' ) }
						</WCconButton>
						<ListBox activeShortcode={ activeShortcode } setActiveShortcode={ setActiveShortcode } />

						<Tooltip title={ __( 'Save current item', 'wccontour' ) } placement="top">
							<LoadingButton
								color="secondary"
								onClick={ saveData }
								loading={ loading }
								loadingPosition="start"
								startIcon={ <SaveIcon /> }
								variant="contained"
								sx={ { marginRight: '10px' } }
							>
								{ __( 'Save item', 'wccontour' ) }
							</LoadingButton>
						</Tooltip>
						<Tooltip title={ __( 'Remove current item', 'wccontour' ) } placement="top">
							<Button
								variant="contained"
								color="wcerror"
								startIcon={ <DeleteIcon /> }
								onClick={ () => setOpenedRemoveData( true ) }
							>
								{ __( 'Remove item', 'wccontour' ) }
							</Button>
						</Tooltip>
						<Dialog
							onClose={ () => setOpenedRemoveData( false ) }
							open={ openedRemoveData }
							sx={ { '& .MuiPaper-root': { padding: '0px 50px 10px 30px' } } }
						>
							<BootstrapDialogTitle onClose={ () => setOpenedRemoveData( false ) }>
								{ __( 'Are you sure ?', 'wccontour' ) }
							</BootstrapDialogTitle>

							<DialogActions>
								<Button variant="contained" color="wcerror" onClick={ removeData }>
									{ __( 'Confirm', 'wccontour' ) }
								</Button>
								<Button
									variant="outlined"
									color="primary"
									onClick={ () => setOpenedRemoveData( false ) }
								>
									{ __( 'Cancel', 'wccontour' ) }
								</Button>
							</DialogActions>
						</Dialog>

						<Dialog
							onClose={ () => setPremiumDialog( false ) }
							open={ premiumDialog }
							sx={ { '& .MuiPaper-root': { padding: '0px 50px 10px 30px' } } }
						>
							<BootstrapDialogTitle onClose={ () => setPremiumDialog( false ) }>
								{ __( 'Upgrade to PRO plan', 'wccontour' ) }
							</BootstrapDialogTitle>

							<DialogActions>
								<WCconButton
									variant="contained"
									color="error"
									href={ WCCON_BUILDER_ADMIN.pricing_url }
									sx={ { '&:hover, &:focus': { color: '#fff' }, mr: 1 } }
									bgColor={ pink[ 400 ] }
									hoverBgColor={ pink[ 600 ] }
								>
									{ __( 'Upgrade', 'wccontour' ) }
								</WCconButton>
								<Button variant="outlined" color="primary" onClick={ () => setPremiumDialog( false ) }>
									{ __( 'Cancel', 'wccontour' ) }
								</Button>
							</DialogActions>
						</Dialog>
					</ShortCodeContent>
				) : (
					<ShortCodeContent>
						<Typography component="h4" variant="h4">
							{ __( 'First add builder', 'wccontour' ) }
						</Typography>
					</ShortCodeContent>
				) }
			</ShortCodeWrapper>
			<Snackbar
				anchorOrigin={ { vertical: 'top', horizontal: 'right' } }
				open={ message.opened }
				autoHideDuration={ 4000 }
				onClose={ () => setMessage( { ...message, opened: false } ) }
				key={ 'top-right' }
				sx={ { top: '70px !important' } }
			>
				<div>
					<Alert type={ message.type }>{ message.text }</Alert>
				</div>
			</Snackbar>
			<Snackbar
				anchorOrigin={ { vertical: 'top', horizontal: 'right' } }
				open={ message2.opened }
				autoHideDuration={ 8000 }
				onClose={ () => setMessage2( { ...message2, opened: false } ) }
				key={ 'top-right2' }
				sx={ { top: '140px !important' } }
			>
				<div>
					<Alert type={ message2.type }>{ message2.text }</Alert>
				</div>
			</Snackbar>
		</Box>
	);
};

export default WCBuilder;
