/**
 * External dependencies
 */
import styled from '@emotion/styled';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { styled as muStyled } from '@mui/material/styles';

export const ShortCodeWrapper = styled.div`
	display: flex;
	align-items: flex-start;
`;

export const ShortCodeNav = styled.div`
	width: 20%;
	border-right: 1px solid #ddd;
	padding-right: 20px;
`;
export const ShortCodeContent = muStyled( 'div' )( ( { theme } ) => ( {
	width: '80%',
	marginLeft: '80px',
	[ theme.breakpoints.down( 'clg' ) ]: {
		marginLeft: '20px',
	},
} ) );
export const ProductQueryDialog = muStyled( Dialog )( ( { theme } ) => ( {
	'& > .MuiDialog-container > .MuiPaper-root': {
		overflow: 'visible',
	},
	[ theme.breakpoints.down( 'xl' ) ]: {
		// zIndex: 12130,
	},
} ) );
export const IconButtonAdd = styled( IconButton )`
	background-color: rgb( 25, 118, 210 );
	:hover {
		background-color: rgb( 21, 101, 192 );
	}
	color: white;
	margin: 30px;
`;
export const AccordionHeaderInner = styled.div`
	display: flex;
	align-items: center;
`;
export const UploadContainer = styled( 'div' )`
	border: ${ ( prop ) => ( prop.isUpload ? '2px dashed #ddd' : '2px solid transparent' ) };
	display: block;
	margin: 0 10px 10px 0;
	width: ${ ( prop ) => ( prop.isUpload ? '150px' : 'auto' ) };
	height: 120px;
	color: rgba( 45, 45, 45, 0.21 );
	background: transparent;
	position: relative;
	& .MuiSvgIcon-root {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate( -50%, -50% );
		transition: all 0.3s ease;
	}
	& .delete-gallery {
		visibility: hidden;
		opacity: 0;
		transition: all 0.3s ease;
		position: absolute;
		top: 0;
		right: 0;
		width: 32px;
		height: 32px;
		background-color: #fff !important;
		box-shadow: -2px 3px 5px #666;
		transform: translate( 30%, -50% );
	}
	& .add-text {
		visibility: hidden;
		opacity: 0;
		transition: all 0.3s ease;
		position: absolute;
		top: 0;
		left: 0;
		width: 32px;
		height: 32px;
		background-color: #fff !important;
		box-shadow: -2px 3px 5px #666;
		transform: translate( 20%, -50% );
	}
	:hover .delete-gallery .MuiSvgIcon-root {
		color: #cc5a71;
	}
	:hover > .MuiSvgIcon-root {
		color: #cc5a71;
	}
	:hover .delete-gallery {
		visibility: visible;
		opacity: 1;
	}
	:hover .add-text {
		visibility: visible;
		opacity: 1;
	}

	cursor: pointer;
`;

export const BootstrapDialogTitle = ( props ) => {
	const { children, onClose, ...other } = props;

	return (
		<DialogTitle sx={ { m: 0, p: 2, textAlign: 'center' } } { ...other }>
			{ children }
			{ onClose ? (
				<IconButton
					aria-label="close"
					onClick={ onClose }
					sx={ {
						position: 'absolute',
						right: 8,
						top: 8,
						color: ( theme ) => theme.palette.grey[ 500 ],
					} }
				>
					<CloseIcon />
				</IconButton>
			) : null }
		</DialogTitle>
	);
};

export const WCconButton = styled( Button )`
	background-color: ${ ( prop ) => prop.bgColor };
	color: ${ ( prop ) => ( prop.textColor ? prop.textColor : '#fff' ) };
	:hover {
		background-color: ${ ( prop ) => prop.hoverBgColor };
		color: ${ ( prop ) => ( prop.hoverColor ? prop.hoverColor : '#fff' ) };
	}
`;
export const WidgetRow = styled.div`
	&:not( :last-of-type ) {
		margin-bottom: 10px;
	}
`;
export const WidgetRowInner = styled.div`
	padding: 10px;
	background: #bbdefb;
	display: flex;
	align-items: center;
`;
