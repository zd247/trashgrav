const initialState = {
	isLoading: true,
	isSignedIn: false,
	isDriver: false,
	isAdmin: false,
	currentUser: null,
}

const auth = (state = initialState, action) => {
	switch (action.type) {
		case 'SIGN_IN':
			return {
				...state,
				isSignedIn: true,
				currentUser: action.payload,
				isLoading: false,
			}
		case 'SIGN_OUT':
			return {
				...state,
				isSignedIn: false,
				currentUser: action.payload,
				isLoading: false,
			}

		case 'CHANGE_TO_DRIVER_MODE':
			return {
				...state,
				isDriver: true,
			}
		case 'CHANGE_TO_CUSTOMER_MODE':
			return {
				...state,
				isDriver: false,
			}
		case 'CHANGE_TO_ADMIN_MODE':
			return {
				...state,
				isAdmin: true,
			}
		case 'CHANGE_BACK_FROM_ADMIN_MODE':
			return {
				...state,
				isAdmin: false,
			}
		default:
			return state
	}
}

export default auth
