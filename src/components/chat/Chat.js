import React from 'react';
import StatusHeader from '../status-header/StatusHeader';
import MessageComposer from '../message-composer/MessageComposer';
import './Chat.css';

// class Chat extends React.Component {
// 	constructor ( props ) {
// 		super( props );

// 		this.handleCreateMessage = this.handleCreateMessage.bind( this );
// 	}
// 	handleCreateMessage () {}
// }

const Chat = ( { messages, handleCreateMessage }) => (
	<section
		id='chat'
		// className='col-md-9 ml-sm-auto col-lg-10 px-4'
		className='col-md-9 ml-sm-auto col-lg-10 px-4'
	>
		<StatusHeader />
		<div className='messages-container'>
			{ messages.map( ( message, index ) => (
				<div key={ index }>{ message.message }</div>
			) ) }
		</div>
		<MessageComposer onChange={ handleCreateMessage } />
	</section>
);

export default Chat;