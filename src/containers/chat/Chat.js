import React from 'react';
import StatusHeader from '../../components/status-header/StatusHeader';
import MessageComposer from '../../components/message-composer/MessageComposer';
import {
	createMessage, startChannel, asyncFetchRequests
} from '../../actions';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './Chat.css';

class Chat extends React.Component {
	componentDidMount () {
		this.props.startChannel();
		this.props.asyncFetchRequests();
	}
	render () {
		const {
			createMessage, messages, username, children, requests, newRequest
		} = this.props;
		console.log( 'this.props', this.props );
		return (
			<section
				id='chat'
				// className='col-md-9 ml-sm-auto col-lg-10 px-4'
				className='col-sm-10 ml-sm-auto px-4'
			>
				{ children }
				<StatusHeader
					newRequest={ newRequest}
					username={ username }
					requests={ requests }
				/>
				<ul className='messages-container'>
					{ messages.map( ( message, index ) => (
						<li key={ index }>{ message.message }</li>
					) ) }
				</ul>
				<MessageComposer createMessage={ createMessage } />
			</section>
		);
	}
}

Chat.propTypes = {
	messages: PropTypes.array.isRequired,
	createMessage: PropTypes.func.isRequired,
	startChannel: PropTypes.func.isRequired,
	username: PropTypes.string.isRequired,
	asyncFetchRequests: PropTypes.func.isRequired,
	requests: PropTypes.array.isRequired,
	newRequest: PropTypes.bool.isRequired
};

const mapStateToProps = state => ( {
	messages: state.messages,
	username: state.user.username,
	requests: state.requests,
	newRequest: state.newRequest
} );

export default connect(
	mapStateToProps,
	{
		createMessage,
		startChannel,
		asyncFetchRequests
	}
)( Chat );