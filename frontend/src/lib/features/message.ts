import { createSlice } from "@reduxjs/toolkit";
const messageState = createSlice({
  name: "Message",
  initialState: [],
  reducers: {
    addNotification: (state, action) => {
      state.push(action.payload);
    },
    clearNotifications: () => [],
  },
});

export const {addNotification,clearNotifications}=messageState.actions
export default messageState.reducer