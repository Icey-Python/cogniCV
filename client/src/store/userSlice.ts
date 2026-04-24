import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/api';

interface UserState {
	user: User | null;
	isLoggedIn: boolean;
}

const initialState: UserState = {
	user: null,
	isLoggedIn: false
};

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<User>) => {
			state.user = action.payload;
			state.isLoggedIn = true;
		},
		clearUser: (state) => {
			state.user = null;
			state.isLoggedIn = false;
		},
		updateUser: (state, action: PayloadAction<Partial<User>>) => {
			if (state.user) {
				state.user = { ...state.user, ...action.payload };
			}
		}
	}
});

export const { setUser, clearUser, updateUser } = userSlice.actions;
export default userSlice.reducer;
