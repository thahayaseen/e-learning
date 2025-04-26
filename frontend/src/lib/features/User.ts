import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import axios from "@/services/asios";
import toast from "react-hot-toast";
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
      const reponse = await axios.get("/autherisation", {
        withCredentials: true,
      });
      return reponse;
    } catch (error: any) {
      // toast.error( error.response.data.message)
      await axios.post("/logout");
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : error?.response?.data?.message || "Unexpexted Error"
      );
      // throw new Error(error instanceof Error ?error.message:error?.response?.data?.message||'Unexpexted Error');
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
      state.user = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
    setloading: (state, payload) => {
      state.loading = payload.payload;
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
        const { name, email, role } = action.payload.user;
        state.user = { name, email, role };

        // state.user = action.payload.message; // Ensure `message` is the correct user object
      });
  },
});

export const { setUser, logout, setloading } = slices.actions;
export default slices.reducer;
