import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import axios from "@/services/asios";
interface Users {
  user: {
    name: string;
    email: string;
    roll: string;
  }|null;
  loading: boolean;
  isAuthenticated: boolean;
}
export const Varify = createAsyncThunk(
  "auth/varifytocken",
  async (_, { rejectWithValue }) => {
    try {
      console.log("clicked");

      const reponse = await axios.post("/autherisation");
      console.log(reponse);

      return reponse;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(axiosError.response?.data || "unknow Error");
    }
  }
);
const initialState: Users = {
  user:null,
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
     
      console.log('removed');
      
    },
    loading:(state)=>{
      state.loading=!state.loading
      console.log(state.loading,'changed');
      
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(Varify.pending, (state) => {
        state.loading = true;
      })
      .addCase(Varify.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action);
      });
  },
});

export const { setUser,logout,loading } = slices.actions;
export default slices.reducer;
