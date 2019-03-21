export const nullOrObject = ( props, propName/*, componentName */ ) => {
	const data = props[ propName ];

	if ( data === undefined ) {
		return new Error( `"${ propName }" is Undefined` );
	}
	if ( data === null ) {
		return;
	}
	if ( data.toString() !== '[object Object]'  ) {
		return new Error( `${ propName } must be an object` );
	}
}