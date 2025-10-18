import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../utils/api';

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: { id: string; name: string; email: string; balance?: number } | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  user: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (
    { name, email, password, phone }: { name: string; email: string; password: string; phone?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, phone });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Registration failed');
    }
  }
);

export const loadSession = createAsyncThunk('auth/loadSession', async () => {
  const token = await AsyncStorage.getItem('token');
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  const userJson = await AsyncStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  return { token, refreshToken, user };
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout');
  } catch {}
  await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
  return {};
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        AsyncStorage.setItem('token', action.payload.token);
        AsyncStorage.setItem('refreshToken', action.payload.refreshToken);
        AsyncStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      })
      .addCase(loadSession.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.refreshToken = null;
        state.user = null;
      });
  },
});

export default authSlice.reducer;
