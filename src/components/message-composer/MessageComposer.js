import React from 'react';
import PropTypes from 'prop-types';
import './MessageComposer.css'

let input;

const MessageComposer = ( {
	createMessage,
	conversationId,
	conversationType,
	dictionary
} ) => (
	<div className='message-composer'>
		<div className='input-group'>
			<input
				className='form-control mt-auto'
				type='text'
				placeholder={ dictionary.inputPlaceholder }
				// placeholder='Write something...'
				onKeyUp={ e => {
					if ( e.key === 'Enter' ) {
						createMessage( {
							conversationId,
							conversationType,
							message: input.value.trim()
						} );

						input.value = '';
					}
				} }
				ref={ node => input = node }
			/>
			<div className='input-group-append'>
				<button
					type='button'
					className='btn btn-primary'
					onClick={ e => {
						// createMessage( conversationId, input.value.trim() );
						createMessage( {
							conversationId,
							conversationType,
							message: input.value.trim()
						} );

						input.value = '';
					} }
				>
					{ dictionary.send }
					{/* Send */}
				</button>
			</div>
		</div>
	</div>
);

MessageComposer.propTypes = {
	createMessage: PropTypes.func.isRequired,
	conversationId: PropTypes.string.isRequired
}

export default MessageComposer;