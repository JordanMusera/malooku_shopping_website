import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { WritableDraft } from "immer"

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
        },
        setPayments(state,action:PayloadAction<PaymentMethods[]>){
            state.paymentMethods = action.payload
        },
        addShippingAddress(state,action:PayloadAction<ShippingAddress>){
           const newItem = action.payload;
           state.shippingAddress.push({
            county:newItem.county,
            city:newItem.city,
            street:newItem.street,
            postalCode:newItem.postalCode
           })

           addSA(newItem);
        },
        deleteShippingAddress(state, action: PayloadAction<number>) {
            state.shippingAddress.splice(action.payload, 1);
            console.log("Deleted address at index: " + action.payload);
        },

        addPaymentMethod(state,action:PayloadAction<PaymentMethods>){
            const newItem = action.payload;
            state.paymentMethods.push({
                accName:newItem.accName,
                accNumber:newItem.accNumber,
                accType:newItem.accType
            })

            addPM(newItem);
        },

        removePaymentMethod(state,action:PayloadAction<number>){
            state.paymentMethods.splice(action.payload, 1);
        }
    }
});

const addSA=async(newItem: ShippingAddress)=>{
    const res = await fetch('/api/users/update/shippingAddress',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            newShippingAddress:newItem
        })
    });
    const response = await res.json();
    
}

const addPM=async(newItem: PaymentMethods)=>{
    console.log('ADDPM')
    const res = await fetch('/api/users/update/payment',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            paymentDetails:newItem
        })
    })
}

export const {setShippingAddress,setPayments,addShippingAddress,addPaymentMethod,removePaymentMethod,deleteShippingAddress} = userSlice.actions;
export default userSlice.reducer;

