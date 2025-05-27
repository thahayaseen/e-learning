import { createSlice } from "@reduxjs/toolkit";

interface initialstate{
    theam:boolean
}
const initialState:initialstate={
        theam:false
}
const theamslice=createSlice({
    name:'theam',
    initialState,
    reducers:{
        changetheam:(state)=>{
            state.theam=!state.theam
        }
    }
})
export default theamslice.reducer
export const {changetheam}=theamslice.actions