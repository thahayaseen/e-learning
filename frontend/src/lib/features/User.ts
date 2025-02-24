import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import axios from "@/services/asios";
interface Users {
  user: {
    name: string;
    email: string;
    role: string;
  } | null;
  loading: boolean;
  isAuthenticated: boolean;
}
export const Varify = createAsyncThunk(
  "auth/varifytocken",
  async (_, { rejectWithValue }) => {
    try {
      console.log("clicked");

      const reponse = await axios.get("/autherisation", { 
    
        withCredentials: true 
      })
      console.log(reponse);

      return reponse;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(axiosError.response?.data || "unknow Error");
    }
  }
);
const initialState: Users = {
  user: null,
  loading: false,
  isAuthenticated: false,
};
const slices = createSlice({
  name: "Users",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.isAuthenticated = true;
      // console.log(action.payload,"pausersss");

      state.user = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;

      console.log("removed");
    },
    loading: (state, payload) => {
      state.loading = payload.payload;
      console.log(state.loading, "changed");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(Varify.pending, (state) => {
        state.loading = true; // Consistent naming
      })
      .addCase(Varify.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false; // Ensure failed verification logs user out
      })
      .addCase(Varify.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loading = false;
        console.log(action, "in case");
        const { name, email, role } = action.payload.user;
        state.user = { name, email, role };

        // state.user = action.payload.message; // Ensure `message` is the correct user object
      });
  },
});

export const { setUser, logout, loading } = slices.actions;
export default slices.reducer;
