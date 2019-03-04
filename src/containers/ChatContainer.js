import { connect } from 'react-redux';
import Chat from '../components/chat/Chat';
import { sendMessage } from '../actions';

const mapStateToProps = state => ( {
	messages: state
} );
const mapDispatchToProps = dispatch => ( {
	handleCreateMessage: text => dispatch( sendMessage( text ) )
} );

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( Chat );