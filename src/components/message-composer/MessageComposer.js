import React from 'react';
import './MessageComposer.css'

let input;

const MessageComposer = ( { onChange } ) => (
	<div className='input-group message-composer'>
		<input
			className='form-control mt-auto'
			type='text'
			placeholder='Write something...'
			onKeyUp={ e => {
				if ( e.key === 'Enter' ) {
					onChange( input.value.trim() );
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
					onChange( input.value.trim() );
					input.value = '';
				} }
			>
				Send
			</button>
		</div>
	</div>
);

export default MessageComposer;