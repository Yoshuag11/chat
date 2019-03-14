import React from 'react';
import StatusHeader from '../../components/status-header/StatusHeader';
import MessageComposer from '../../components/message-composer/MessageComposer';
import { createMessage, startChannel } from '../../actions';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './Chat.css';

class Chat extends React.Component {
	componentDidMount () {
		this.props.startChannel();
	}
	render () {
		const {
			createMessage, messages, username, children
		} = this.props;
		console.log( this.props );
		return (
			<section
				id='chat'
				// className='col-md-9 ml-sm-auto col-lg-10 px-4'
				className='col-sm-10 ml-sm-auto px-4'
			>
				{ children }
				<StatusHeader username={ username } />
				{/* TODO: change this for ul tag */}
				<div className='messages-container'>
					{ messages.map( ( message, index ) => (
						<div key={ index }>{ message.message }</div>
					) ) }
				</div>
				<MessageComposer onChange={ createMessage } />
			</section>
		);
	}
}

Chat.propTypes = {
	messages: PropTypes.array.isRequired,
	createMessage: PropTypes.func.isRequired,
	startChannel: PropTypes.func.isRequired,
	username: PropTypes.string.isRequired
};

const mapStateToProps = state => ( {
	messages: state.messages,
	username: state.user.username
} );

export default connect(
	mapStateToProps,
	{
		createMessage,
		startChannel
	}
)( Chat );