/**
 * External dependencies
 */

import { render, useState, useEffect, forwardRef, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FormControl from '@mui/material/FormControl';

import { Button, IconButton, Select, TextField } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import FormHelperText from '@mui/material/FormHelperText';
import { ThemeProvider } from '@mui/material/styles';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import UpdateIcon from '@mui/icons-material/Update';
import PersonalVideoIcon from '@mui/icons-material/PersonalVideo';
import TabletAndroidIcon from '@mui/icons-material/TabletAndroid';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { pink } from '@mui/material/colors';

/**
 * Internal dependencies
 */
import wcconTheme from './helpers/theme';
import './helpers/field-types';
import { BootstrapDialogTitle, WCconButton } from './styled-components/components';

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel( props: TabPanelProps ) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={ value !== index }
			id={ `vertical-tabpanel-${ index }` }
			aria-labelledby={ `vertical-tab-${ index }` }
			{ ...other }
		>
			{ value === index && <Box sx={ { p: 3 } }>{ children }</Box> }
		</div>
	);
}

function a11yProps( index: number ) {
	return {
		id: `vertical-tab-${ index }`,
		'aria-controls': `vertical-tabpanel-${ index }`,
	};
}

const Alert = ( props ) => {
	return <MuiAlert elevation={ 6 } severity={ props.type } variant="filled" { ...props } />;
};

const Settings = () => {
	const [ shortcodes, setShortcodes ] = useState( WCCON_SETTINGS.shortcodes || [] );
	const [ activeShortcode, setActiveShortcode ] = useState( '' );
	const [ debugValue, setDebugValue ] = useState( '' );
	const [ selectedTab, setSelectedTab ] = useState( 0 );

	const [ loading, setLoading ] = useState( false );
	const [ loadingDelete, setLoadingDelete ] = useState( false );
	const [ loadingImport, setLoadingImport ] = useState( false );
	const [ loadingUpdate, setLoadingUpdate ] = useState( false );
	const [ openedRemoveData, setOpenedRemoveData ] = useState( false );
	const [ message, setMessage ] = useState( {
		opened: false,
		text: '',
		type: '',
	} );
	const [ linkToPage, setLinkToPage ] = useState( { html: '' } );
	const textRef = useRef( null );
	const defaultSettings = {
		account_endpoint: 'wccon-builder',
		account_title: __( 'Saved lists', 'wccontour' ),
		list_limit: 10,
		product_limit: 10,
		delete_data: false,
		enabled_compat: true,
		local_storage: true,
		count_list: 30,
		style: {
			sticky_desktop: true,
			sticky_tablet: false,
			sticky_mobile: false,
			button_variations: false,
			image_size: 'medium',
		},
		multilang: {
			show_modal: false,
			show_account: false,
		},
		socials: {
			items: {
				link: 'enabled',
				facebook: 'enabled',
				twitter: 'enabled',
				viber: '',
				pinterest: '',
				telegram: '',
				whatsapp: '',
				linkedin: '',
			},
		},
	};

	const [ color, setColor ] = useState( '#f00' );
	const colors = [
		{ name: 'red', color: '#f00' },
		{ name: 'white', color: '#fff' },
		{ name: 'blue', color: '#00f' },
	];

	const prepareSettings = ( data ) => {
		const newData = {
			account_endpoint: data.account_endpoint,
			account_title: data.account_title,
			list_limit: data.list_limit,
			product_limit: data.product_limit,
			count_list: data.count_list,
			enabled_compat: data.enabled_compat || data.enabled_compat === '1' ? true : false,
			delete_data: data.delete_data || data.delete_data === '1' ? true : false,
			local_storage: data.local_storage || data.local_storage === '1' ? true : false,
			style: {
				sticky_desktop: data.style.sticky_desktop || data.style.sticky_desktop === '1' ? true : false,
				sticky_tablet: data.style.sticky_tablet || data.style.sticky_tablet === '1' ? true : false,
				sticky_mobile: data.style.sticky_mobile || data.style.sticky_mobile === '1' ? true : false,
				button_variations: data.style.button_variations || data.style.button_variations === '1' ? true : false,
				image_size: data.style.image_size,
			},
			multilang: {
				show_account: data.multilang.show_account || data.multilang.show_account === '1' ? true : false,
				show_modal: data.multilang.show_modal || data.multilang.show_modal === '1' ? true : false,
			},
			socials: data.socials,
		};
		return newData;
	};

	const [ settings, setSettings ] = useState(
		WCCON_SETTINGS.data ? prepareSettings( WCCON_SETTINGS.data ) : defaultSettings
	);

	const userPro = WCCON_SETTINGS.pro ? true : false;

	const socialsItems = applyFilters( 'wccontour-social-items', [] );
	const handleSelectTab = ( event: React.SyntheticEvent, newValue: number ) => {
		setSelectedTab( newValue );
	};
	const setAccountEndpoint = ( e ) => {
		setSettings( { ...settings, account_endpoint: e.target.value } );
	};
	const setAccountTItle = ( e ) => {
		setSettings( { ...settings, account_title: e.target.value } );
	};
	const setPerPage = ( e ) => {
		setSettings( { ...settings, list_limit: e.target.value } );
	};
	const setPerPageProduct = ( e ) => {
		setSettings( { ...settings, product_limit: e.target.value } );
	};
	const saveToLocalStorage = ( e ) => {
		setSettings( { ...settings, local_storage: e.target.checked } );
	};
	const showAllLangs = ( e ) => {
		setSettings( { ...settings, multilang: { ...settings.multilang, show_modal: e.target.checked } } );
	};
	const showAllLangsAccount = ( e ) => {
		setSettings( { ...settings, multilang: { ...settings.multilang, show_account: e.target.checked } } );
	};
	const handleCountList = ( e ) => {
		setSettings( { ...settings, count_list: e.target.value } );
	};
	const handleChangeDebug = ( e ) => {
		//console.log( e.target.value );
		// setDebugValue( e.target.value );
		textRef.current.value = e.target.value;
	};

	const handleRespControl = ( e, name ) => {
		setSettings( {
			...settings,
			style: {
				...settings.style,
				[ name ]: e.target.checked,
			},
		} );
	};

	const setButtonVariations = ( e ) => {
		setSettings( {
			...settings,
			style: {
				...settings.style,
				[ name ]: e.target.checked,
			},
		} );
	};

	const selectSocial = ( e ) => {
		setSettings( {
			...settings,
			socials: {
				...settings.socials,
				items: {
					...settings.socials.items,
					[ e.target.name ]: e.target.checked ? 'enabled' : 'disabled',
				},
			},
		} );
	};

	const handleSelectSize = ( e ) => {
		setSettings( {
			...settings,
			style: {
				...settings.style,
				image_size: e.target.value,
			},
		} );
	};

	const saveData = () => {
		setLoading( true );
		const formData = new FormData();
		const abortController = new AbortController();
		formData.append( 'action', 'wccon_save_settings' );
		formData.append( 'data', JSON.stringify( settings ) );
		formData.append( 'nonce', WCCON_SETTINGS.nonce );
		try {
			fetch( WCCON_SETTINGS.ajax_url, {
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
							text: __( 'Settings saved!', 'wccontour' ),
						} );
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
				setMessage( {
					opened: true,
					type: 'error',
					text: __( 'Something went wrong', 'wccontour' ),
				} );
			}
			console.log( err );
		}
	};

	const deleteData = ( e ) => {
		setSettings( {
			...settings,
			delete_data: e.target.checked,
		} );
	};

	const deleteDataAjax = () => {
		setLoadingDelete( true );
		const formData = new FormData();
		const abortController = new AbortController();
		formData.append( 'action', 'wccon_delete_all_data' );
		formData.append( 'nonce', WCCON_SETTINGS.nonce );
		try {
			fetch( WCCON_SETTINGS.ajax_url, {
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
							text: __( 'Settings saved!', 'wccontour' ),
						} );
						setShortcodes( [] );
						setActiveShortcode( '' );
						setOpenedRemoveData( false );
					} else {
						setMessage( {
							opened: true,
							type: 'error',
							text: __( 'Something went wrong', 'wccontour' ),
						} );
					}
					setLoadingDelete( false );
				} );
		} catch ( err ) {
			if ( ! abortController.signal.aborted ) {
				setLoadingDelete( false );
			}
			console.log( err );
		}
	};
	const enableCompatibility = ( e ) => {
		setSettings( {
			...settings,
			enabled_compat: e.target.checked,
		} );
	};

	const demoImport = ( args = {} ) => {
		setLoadingImport( true );
		const formData = new FormData();
		const abortController = new AbortController();
		formData.append( 'action', 'wccon_ajax_demo_import' );
		formData.append( 'nonce', WCCON_SETTINGS.nonce );
		formData.append( 'id', args.id );
		if ( typeof args.position !== 'undefined' ) {
			formData.append( 'position', args.position );
		}
		try {
			fetch( WCCON_SETTINGS.ajax_url, {
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
						if ( res.data.position === 'done' ) {
							setMessage( {
								opened: true,
								type: 'success',
								text: __( 'Imported!', 'wccontour' ),
							} );
							setLoadingImport( false );
							setLinkToPage( {
								html: `<a href="${ res.data.page_url }" target="_blank">${ __(
									'View Builder',
									'wccontour'
								) }</a>`,
							} );
						} else {
							demoImport( { id: args.id, position: res.data.position_index } );
						}
					} else {
						setMessage( {
							opened: true,
							type: 'error',
							text: res.data.message,
						} );
						setLoadingImport( false );
					}
				} );
		} catch ( err ) {
			if ( ! abortController.signal.aborted ) {
				setLoadingImport( false );
			}
			console.log( err );
		}
	};

	const getActiveShortcodeDump = ( id = 0 ) => {
		const foundItem = shortcodes.find( ( shortcode ) => shortcode.id === ( id ? id : activeShortcode ) );
		if ( foundItem ) {
			// return 'dfsdfs';
			return JSON.stringify( foundItem );
		}
		return '';
	};

	const handleChangeShortcode = ( e ) => {
		setActiveShortcode( e.target.value );
		textRef.current.value = getActiveShortcodeDump( e.target.value );
		// setDebugValue( getActiveShortcodeDump( e.target.value ) );
	};

	const updateItem = () => {
		setLoadingUpdate( true );
		const formData = new FormData();
		const abortController = new AbortController();
		const foundItem = shortcodes.find( ( shortcode ) => shortcode.id === activeShortcode );
		if ( ! foundItem ) {
			setMessage( {
				opened: true,
				type: 'error',
				text: __( 'ID not found', 'wccontour' ),
			} );
			return;
		}
		formData.append( 'action', 'wccon_update_list_item' );
		formData.append( 'id', activeShortcode );
		formData.append( 'data', textRef.current.value );
		formData.append( 'nonce', WCCON_SETTINGS.nonce );
		try {
			fetch( WCCON_SETTINGS.ajax_url, {
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
							text: __( 'Updated!', 'wccontour' ),
						} );
					} else {
						const messageError = res.data.message
							? res.data.message
							: __( 'Something went wrong', 'wccontour' );
						setMessage( {
							opened: true,
							type: 'error',
							text: messageError,
						} );
					}
					setLoadingUpdate( false );
				} );
		} catch ( err ) {
			if ( ! abortController.signal.aborted ) {
				setLoadingUpdate( false );
			}
			console.log( err );
		}
	};
	return (
		<Box>
			<Box
				sx={ {
					flexGrow: 1,
					bgcolor: 'background.paper',
					display: 'flex',
					mb: 2,
				} }
			>
				<Tabs
					orientation="vertical"
					value={ selectedTab }
					onChange={ handleSelectTab }
					aria-label="Vertical tabs example"
					sx={ { borderRight: 1, borderColor: 'divider' } }
				>
					<Tab label={ __( 'General', 'wccontour' ) } { ...a11yProps( 0 ) } />
					<Tab label={ __( 'Style', 'wccontour' ) } { ...a11yProps( 1 ) } />
					<Tab label={ __( 'Socials', 'wccontour' ) } { ...a11yProps( 2 ) } />

					<Tab label={ __( 'Import', 'wccontour' ) } { ...a11yProps( 3 ) } />
					<Tab label={ __( 'Data', 'wccontour' ) } { ...a11yProps( 4 ) } />
					{ ! userPro && (
						<WCconButton
							variant="contained"
							color="error"
							href={ WCCON_SETTINGS.pricing_url }
							sx={ { '&:hover, &:focus': { color: '#fff' } } }
							bgColor={ pink[ 400 ] }
							hoverBgColor={ pink[ 600 ] }
						>
							{ __( 'PRO', 'wccontour' ) }
						</WCconButton>
					) }
				</Tabs>
				<TabPanel value={ selectedTab } index={ 0 }>
					<FormControl sx={ { display: 'flex', mb: 1 } }>
						<FormControlLabel
							control={
								<TextField onBlur={ setAccountEndpoint } defaultValue={ settings.account_endpoint } />
							}
							sx={ {
								marginLeft: 0,
								marginRight: 0,
								justifyContent: 'start',
								'& .MuiFormControlLabel-label': { mr: 1, minWidth: 200 },
							} }
							labelPlacement="start"
							label={
								<Box>
									<span>{ __( 'Account endpoint', 'wccontour' ) }</span>
									<FormHelperText sx={ { ml: 0 } }>
										{ __( '(myaccount page)', 'wccontour' ) }
									</FormHelperText>
								</Box>
							}
						/>
					</FormControl>
					<FormControl sx={ { display: 'flex', mb: 1 } }>
						<FormControlLabel
							control={ <TextField onBlur={ setAccountTItle } defaultValue={ settings.account_title } /> }
							sx={ {
								marginLeft: 0,
								marginRight: 0,
								justifyContent: 'start',
								'& .MuiFormControlLabel-label': { mr: 1, minWidth: 200 },
							} }
							labelPlacement="start"
							label={
								<Box>
									<span>{ __( 'Account endpoint title', 'wccontour' ) }</span>
									<FormHelperText sx={ { ml: 0 } }>
										{ __( '(myaccount page)', 'wccontour' ) }
									</FormHelperText>
								</Box>
							}
						/>
					</FormControl>
					<FormControl sx={ { display: 'flex', mb: 1 } }>
						<FormControlLabel
							control={
								<TextField type="number" onBlur={ setPerPage } defaultValue={ settings.list_limit } />
							}
							sx={ {
								marginLeft: 0,
								marginRight: 0,
								justifyContent: 'start',
								'& .MuiFormControlLabel-label': { mr: 1, minWidth: 200 },
							} }
							labelPlacement="start"
							label={
								<Box>
									<span>{ __( 'Saved lists per page', 'wccontour' ) }</span>
									<FormHelperText sx={ { ml: 0 } }>
										{ __( '(myaccount/builder page)', 'wccontour' ) }
									</FormHelperText>
								</Box>
							}
						/>
					</FormControl>
					<FormControl sx={ { display: 'flex', mb: 1 } }>
						<FormControlLabel
							control={
								<TextField
									type="number"
									defaultValue={ settings.count_list }
									onBlur={ handleCountList }
								/>
							}
							labelPlacement="start"
							sx={ {
								marginLeft: 0,
								marginRight: 0,
								justifyContent: 'start',
								'& .MuiFormControlLabel-label': { mr: 1, minWidth: 200 },
							} }
							label={
								<Box>
									<span>{ __( 'Max Saved lists allowed', 'wccontour' ) }</span>
									<FormHelperText sx={ { ml: 0 } }>
										{ __( '(for registered users only)', 'wccontour' ) }
									</FormHelperText>
								</Box>
							}
						/>
					</FormControl>
					<FormControl sx={ { display: 'flex', mb: 1 } }>
						<FormControlLabel
							control={
								<TextField
									type="number"
									onBlur={ setPerPageProduct }
									defaultValue={ settings.product_limit }
								/>
							}
							sx={ {
								marginLeft: 0,
								marginRight: 0,
								justifyContent: 'start',
								'& .MuiFormControlLabel-label': { mr: 1, minWidth: 200 },
							} }
							labelPlacement="start"
							label={
								<Box>
									<span>{ __( 'Products per page', 'wccontour' ) }</span>
									<FormHelperText sx={ { ml: 0 } }>
										{ __( '(builder page)', 'wccontour' ) }
									</FormHelperText>
								</Box>
							}
						/>
					</FormControl>
					<FormControl
						sx={ {
							display: 'flex',
							mb: 1,
							flexDirection: 'row',
							columnGap: '20px',
							alignItems: 'center',
							'& .Mui-disabled p': { color: 'rgba( 0, 0, 0, 0.38 )' },
						} }
					>
						<FormControlLabel
							control={
								<Checkbox
									checked={ ! userPro ? false : settings.enabled_compat }
									disabled={ ! userPro }
									onChange={ enableCompatibility }
								/>
							}
							sx={ { marginLeft: 0, marginRight: 0 } }
							label={
								<Box sx={ { display: 'flex', columnGap: '20px', alignItems: 'center' } }>
									<div>
										<span>{ __( 'Enable products compatibility', 'wccontour' ) }</span>
										<FormHelperText sx={ { ml: 0 } }>
											{ __( '(adds metabox on product page)', 'wccontour' ) }
										</FormHelperText>
									</div>
								</Box>
							}
						/>
						{ ! userPro && (
							<Typography variant="body2" component="span" sx={ { color: '#d32f2f', fontSize: '20px' } }>
								PRO
							</Typography>
						) }
					</FormControl>

					<FormControl
						sx={ {
							display: 'flex',
							mb: 1,
							flexDirection: 'row',
							columnGap: '20px',
							alignItems: 'center',
							'& .Mui-disabled p': { color: 'rgba( 0, 0, 0, 0.38 )' },
						} }
					>
						<FormControlLabel
							control={
								<Checkbox
									checked={ ! userPro ? false : settings.local_storage }
									disabled={ ! userPro }
									onChange={ saveToLocalStorage }
								/>
							}
							sx={ { marginLeft: 0, marginRight: 0 } }
							label={
								<Box>
									<div>
										<span>{ __( 'Save to localStorage', 'wccontour' ) }</span>
										<FormHelperText sx={ { ml: 0 } }>
											{ __(
												'(saves live changes, works both for guest and registered users, saves only one scheme per builder - latest)',
												'wccontour'
											) }
										</FormHelperText>
									</div>
								</Box>
							}
						/>
						{ ! userPro && (
							<Typography variant="body2" component="span" sx={ { color: '#d32f2f', fontSize: '20px' } }>
								PRO
							</Typography>
						) }
					</FormControl>
					<FormControl sx={ { display: 'flex', mb: 1 } }>
						<FormControlLabel
							control={ <Checkbox checked={ settings.multilang.show_modal } onChange={ showAllLangs } /> }
							sx={ { marginLeft: 0, marginRight: 0 } }
							label={
								<Box>
									<span>
										{ __( 'Show Saved lists in all languages on builder page', 'wccontour' ) }
									</span>
									<FormHelperText sx={ { ml: 0 } }>
										{ __( '(when WPML/Polylang enabled)', 'wccontour' ) }
									</FormHelperText>
								</Box>
							}
						/>
					</FormControl>
					<FormControl sx={ { display: 'flex', mb: 1 } }>
						<FormControlLabel
							control={
								<Checkbox
									checked={ settings.multilang.show_account }
									onChange={ showAllLangsAccount }
								/>
							}
							sx={ { marginLeft: 0, marginRight: 0 } }
							label={
								<Box>
									<span>
										{ __( 'Show Saved lists in all languages on account page', 'wccontour' ) }
									</span>
									<FormHelperText sx={ { ml: 0 } }>
										{ __( '(when WPML/Polylang enabled)', 'wccontour' ) }
									</FormHelperText>
								</Box>
							}
						/>
					</FormControl>
				</TabPanel>
				<TabPanel value={ selectedTab } index={ 1 }>
					<Typography component="p" variant="body2" sx={ { fontSize: '16px', fontWeight: 400 } }>
						{ __( 'Sticky total bar', 'wccontour' ) }
					</Typography>
					<Grid container spacing={ 2 }>
						<Grid item xs={ 12 } md={ 6 } lg={ 4 }>
							<IconButton color="primary">
								<PersonalVideoIcon />
							</IconButton>
							<FormControl sx={ { display: 'flex' } }>
								<FormControlLabel
									control={
										<Checkbox
											checked={ settings.style.sticky_desktop }
											onChange={ ( e ) => {
												handleRespControl( e, 'sticky_desktop' );
											} }
										/>
									}
									sx={ { marginLeft: 0, marginRight: 0 } }
									label={
										<Box>
											<span>{ __( 'Enable', 'wccontour' ) }</span>
										</Box>
									}
								/>
							</FormControl>
						</Grid>
						<Grid item xs={ 12 } md={ 6 } lg={ 4 }>
							<IconButton color="primary">
								<TabletAndroidIcon />
							</IconButton>
							<FormControl sx={ { display: 'flex' } }>
								<FormControlLabel
									control={
										<Checkbox
											checked={ settings.style.sticky_tablet }
											onChange={ ( e ) => {
												handleRespControl( e, 'sticky_tablet' );
											} }
										/>
									}
									sx={ { marginLeft: 0, marginRight: 0 } }
									label={
										<Box>
											<span>{ __( 'Enable', 'wccontour' ) }</span>
										</Box>
									}
								/>
							</FormControl>
						</Grid>
						<Grid item xs={ 12 } md={ 6 } lg={ 4 }>
							<IconButton color="primary">
								<PhoneAndroidIcon />
							</IconButton>
							<FormControl sx={ { display: 'flex' } }>
								<FormControlLabel
									control={
										<Checkbox
											checked={ settings.style.sticky_mobile }
											onChange={ ( e ) => {
												handleRespControl( e, 'sticky_mobile' );
											} }
										/>
									}
									sx={ { marginLeft: 0, marginRight: 0 } }
									label={
										<Box>
											<span>{ __( 'Enable', 'wccontour' ) }</span>
										</Box>
									}
								/>
							</FormControl>
						</Grid>
					</Grid>
					<Divider />
					<FormControl sx={ { display: 'flex', mt: 1, mb: 1 } }>
						<FormControlLabel
							control={
								<Checkbox
									checked={ settings.style.button_variations }
									onChange={ ( e ) => handleRespControl( e, 'button_variations' ) }
								/>
							}
							sx={ { marginLeft: 0, marginRight: 0 } }
							label={
								<Box>
									<span>{ __( 'Enable Button type for variation attributes', 'wccontour' ) }</span>
									<FormHelperText sx={ { ml: 0 } }>
										{ __( '(replace standart Select type)', 'wccontour' ) }
									</FormHelperText>
								</Box>
							}
						/>
					</FormControl>
					<Divider />
					<Typography component="p" variant="body2" sx={ { fontSize: '16px', fontWeight: 400, mt: 1 } }>
						{ __( 'Select product image size', 'wccontour' ) }
					</Typography>
					<FormControl sx={ { display: 'flex', mb: 1, mt: 1 } }>
						<InputLabel>{ __( 'Select size', 'wccontour' ) }</InputLabel>
						<Select
							value={ settings.style.image_size }
							label={ __( 'Select size', 'wccontour' ) }
							onChange={ handleSelectSize }
						>
							{ WCCON_SETTINGS.image_sizes.map( ( size ) => (
								<MenuItem key={ size } value={ size }>
									{ size }
								</MenuItem>
							) ) }
						</Select>
						<FormHelperText sx={ { ml: 0 } }>
							{ __( '(Recommended select non-cropped sizes)', 'wccontour' ) }
						</FormHelperText>
					</FormControl>
				</TabPanel>
				<TabPanel value={ selectedTab } index={ 2 }>
					{ socialsItems.map( ( item ) => (
						<FormGroup key={ item.id }>
							<FormControlLabel
								control={
									<Checkbox
										checked={
											typeof settings.socials.items[ item.id ] !== 'undefined'
												? settings.socials.items[ item.id ] === 'enabled'
												: item.default
										}
										onChange={ selectSocial }
										name={ item.id }
									/>
								}
								label={ item.label }
							/>
						</FormGroup>
					) ) }
				</TabPanel>
				<TabPanel value={ selectedTab } index={ 3 }>
					<Grid container spacing={ 2 }>
						<Grid item xs={ 4 } sx={ { display: 'flex', flexDirection: 'column' } }>
							<Box
								sx={ {
									maxWidth: '150px',
									'& img': { width: '100%', height: 'auto', display: 'block' },
								} }
							>
								<img src={ WCCON_SETTINGS.images_path + 'import-comp.jpg' } alt="PC import" />
							</Box>
							<FormHelperText sx={ { mt: 'auto' } }>{ __( 'Computer', 'wccontour' ) }</FormHelperText>
							<LoadingButton
								color="secondary"
								onClick={ () => demoImport( { id: 1 } ) }
								loading={ loadingImport }
								loadingPosition="start"
								startIcon={ <DownloadForOfflineIcon /> }
								variant="contained"
							>
								{ __( 'Import Demo #1*', 'wccontour' ) }
							</LoadingButton>
						</Grid>
						<Grid item xs={ 4 } sx={ { display: 'flex', flexDirection: 'column' } }>
							<Box
								sx={ {
									maxWidth: '150px',
									'& img': { width: '100%', height: 'auto', display: 'block' },
								} }
							>
								<img src={ WCCON_SETTINGS.images_path + 'import-bike.jpg' } alt="Bike import" />
							</Box>
							<FormHelperText sx={ { mt: 'auto' } }>{ __( 'Bicycle', 'wccontour' ) }</FormHelperText>
							<LoadingButton
								color="secondary"
								onClick={ () => demoImport( { id: 2 } ) }
								loading={ loadingImport }
								loadingPosition="start"
								startIcon={ <DownloadForOfflineIcon /> }
								variant="contained"
							>
								{ __( 'Import Demo #2*', 'wccontour' ) }
							</LoadingButton>
						</Grid>
						<Grid item xs={ 4 } sx={ { display: 'flex', flexDirection: 'column' } }>
							<Box
								sx={ {
									maxWidth: '150px',
									'& img': { width: '100%', height: 'auto', display: 'block' },
								} }
							>
								<img src={ WCCON_SETTINGS.images_path + 'import-camping.jpg' } alt="Camping import" />
							</Box>
							<FormHelperText sx={ { mt: 'auto' } }>{ __( 'Camping', 'wccontour' ) }</FormHelperText>
							<LoadingButton
								color="secondary"
								onClick={ () => demoImport( { id: 3 } ) }
								loading={ loadingImport }
								loadingPosition="start"
								startIcon={ <DownloadForOfflineIcon /> }
								variant="contained"
							>
								{ __( 'Import Demo #3*', 'wccontour' ) }
							</LoadingButton>
						</Grid>
					</Grid>
					<Box sx={ { mt: 2 } }>
						<div dangerouslySetInnerHTML={ { __html: linkToPage.html } }></div>
					</Box>
					<FormHelperText sx={ { mt: 2 } }>
						{ __(
							'*Import contains SVG icons, you should have installed SVG support plugin to properly import those icons',
							'wccontour'
						) }
					</FormHelperText>
				</TabPanel>
				<TabPanel value={ selectedTab } index={ 4 }>
					<FormControl sx={ { display: 'flex', mb: 1 } }>
						<FormControlLabel
							control={ <Checkbox checked={ settings.delete_data } onChange={ deleteData } /> }
							label={ __(
								'Delete on uninstall all data associated with this plugin, including custom tables',
								'wccontour'
							) }
						/>
					</FormControl>
					<FormControl>
						<Button
							color="wcerror"
							onClick={ () => setOpenedRemoveData( true ) }
							startIcon={ <DeleteOutlineIcon /> }
							variant="contained"
							sx={ { maxWidth: '200px' } }
						>
							{ __( 'Clear all data', 'wccontour' ) }
						</Button>
						<FormHelperText>
							{ __( '*By clicking all data will be deleted irrevocably', 'wccontour' ) }
						</FormHelperText>
					</FormControl>
					<Typography variant="h5" component="p" sx={ { fontSize: '18px', mt: 2, fontWeight: 500 } }>
						{ __( 'Debugging', 'wccontour' ) }
					</Typography>
					<FormControl sx={ { display: 'flex', mb: 1, mt: 2 } }>
						<InputLabel>{ __( 'Select item', 'wccontour' ) }</InputLabel>
						<Select
							value={ activeShortcode }
							label={ __( 'Select item', 'wccontour' ) }
							onChange={ handleChangeShortcode }
						>
							{ shortcodes.map( ( shortcode ) => (
								<MenuItem key={ shortcode.title + '-' + shortcode.id } value={ shortcode.id }>
									{ shortcode.title }
								</MenuItem>
							) ) }
						</Select>
					</FormControl>
					<FormControl sx={ { display: 'flex', mb: 1 } }>
						<TextField
							label={ __( '' ) }
							multiline
							rows={ 4 }
							// value={ debugValue }
							onBlur={ handleChangeDebug }
							inputRef={ textRef }
							variant="outlined"
							sx={ { minWidth: '400px' } }
						/>
					</FormControl>
					<FormControl>
						<LoadingButton
							color="primary"
							onClick={ updateItem }
							loading={ loadingUpdate }
							loadingPosition="start"
							startIcon={ <UpdateIcon /> }
							variant="contained"
							sx={ { maxWidth: '200px' } }
						>
							{ __( 'Update', 'wccontour' ) }
						</LoadingButton>
						<FormHelperText>
							{ __( '*By clicking selected item will be updated irrevocably', 'wccontour' ) }
						</FormHelperText>
					</FormControl>

					<Dialog
						onClose={ () => setOpenedRemoveData( false ) }
						open={ openedRemoveData }
						sx={ { '& .MuiPaper-root': { padding: '0px 20px 10px 20px' } } }
					>
						<BootstrapDialogTitle onClose={ () => setOpenedRemoveData( false ) }>
							{ __( 'Are you sure ?', 'wccontour' ) }
						</BootstrapDialogTitle>

						<DialogActions>
							<LoadingButton
								variant="contained"
								color="wcerror"
								onClick={ deleteDataAjax }
								loading={ loadingDelete }
								loadingPosition="start"
							>
								{ __( 'Confirm', 'wccontour' ) }
							</LoadingButton>
							<Button variant="outlined" color="primary" onClick={ () => setOpenedRemoveData( false ) }>
								{ __( 'Cancel', 'wccontour' ) }
							</Button>
						</DialogActions>
					</Dialog>
				</TabPanel>
			</Box>
			<LoadingButton
				color="secondary"
				onClick={ saveData }
				loading={ loading }
				loadingPosition="start"
				startIcon={ <SaveIcon /> }
				variant="contained"
			>
				{ __( 'Save', 'wccontour' ) }
			</LoadingButton>
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
		</Box>
	);
};

const SettingsApp = () => {
	return (
		<ThemeProvider theme={ wcconTheme }>
			<Settings />
		</ThemeProvider>
	);
};

render( <SettingsApp />, document.querySelector( '#wccon-settings' ) );
