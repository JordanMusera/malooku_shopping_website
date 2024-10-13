import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface ShippingAddress{
    county: String,
    city: String,
    street: String,
    postalCode: String
}

interface PaymentMethods{
    accName: String,
    accNumber: Number,
    accType: String
}

interface UserObj{
    address: {
        county: String,
        city: String,
        street: String,
    },
    id: String,
    username: String,
    fullname: String,
    email: String,
    phone: String,
    password: String,
    shippingAddress: ShippingAddress[],
    paymentMethods: PaymentMethods[]
}

const initialState:UserObj={
    address: {
        county: '',
        city: '',
        street: ''
    },
    id: '',
    username: '',
    fullname: '',
    email: '',
    phone: '',
    password: '',
    shippingAddress: [],
    paymentMethods: []
}

const userSlice = createSlice({
    initialState,
    name:"user",
    reducers:{
        setShippingAddress(state,action:PayloadAction<UserObj["shippingAddress"]>){
            state.shippingAddress = action.payload;
            console.log("SET SHIPPING ADDRESS RUNNING: "+action.payload)
        },
        setPayments(state,action:PayloadAction<PaymentMethods[]>){
            state.paymentMethods = action.payload
        },
        addShippingAddress(state,action:PayloadAction<ShippingAddress>){
            console.log("ADD SHIIPPING ADD")
           const newItem = action.payload;
           state.shippingAddress.push({
            county:newItem.county,
            city:newItem.city,
            street:newItem.street,
            postalCode:newItem.postalCode
           })
        },

        addPaymentMethod(state,action:PayloadAction<PaymentMethods>){
            const newItem = action.payload;
            state.paymentMethods.push({
                accName:newItem.accName,
                accNumber:newItem.accNumber,
                accType:newItem.accType
            })
        },

        removePaymentMethod(state,action:PayloadAction<PaymentMethods>){
            const deleteItem = action.payload;
            state.paymentMethods = state.paymentMethods.filter(item=>item.accNumber!==deleteItem.accNumber);
        }
    }
});

export const {setShippingAddress,setPayments,addShippingAddress,addPaymentMethod,removePaymentMethod} = userSlice.actions;
export default userSlice.reducer;

