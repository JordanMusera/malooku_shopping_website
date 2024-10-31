import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { setShippingAddress } from "./userSlice";

interface ShippingAddress{
    postalCode: string;
    street: string;
    city: string;
    county: string;
    _id:string;
}

interface PaymentMethod{
    accType: string,
    accNumber: number;
    accName: string;
    _id:string;
}

interface DeliveryInfo{
    deliveryType: string,
    pickupStation: string
}


interface OrderInfo {
    shippingAddress2:ShippingAddress,
    paymentMethod:PaymentMethod
    deliveryInfo:DeliveryInfo
}

const initialState: OrderInfo = {
    shippingAddress2: {
        postalCode: '',
        street: '',
        city: '',
        county: '',
        _id: ""
    },
    paymentMethod: {
        accType: 'mpesa',
        accNumber: 0,
        accName: '',
        _id: ""
    },
    deliveryInfo: {
        deliveryType: 'pickup-station',
        pickupStation: ''
    }
};

const orderInfoSlice = createSlice({
    initialState,
    name:'order',
    reducers:{
        setShippingAddress2(state,action:PayloadAction<ShippingAddress>){
            state.shippingAddress2=action.payload;
        },

        setPaymentInfo(state,action:PayloadAction<PaymentMethod>){
            state.paymentMethod=action.payload;
            console.log(state.paymentMethod)
        },

        setDeliveryInfo(state,action:PayloadAction<DeliveryInfo>){
            state.deliveryInfo=action.payload;
        }
    }
});

export const {setShippingAddress2,setPaymentInfo,setDeliveryInfo} = orderInfoSlice.actions;
export default orderInfoSlice.reducer;
