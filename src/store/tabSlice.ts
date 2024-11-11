import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface Tab{
    clickedTab:string
}

const initialState:Tab={
    clickedTab:'edit_profile'
}

const tabSlice = createSlice({
    initialState,
    name:'acc_clicked_tab',
    reducers:{
        setClickedTab(state,action:PayloadAction<string>){
            state.clickedTab = action.payload;
        }
    }
});

export const {setClickedTab} = tabSlice.actions;
export default tabSlice.reducer;