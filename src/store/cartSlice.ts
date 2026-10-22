'use client'
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { WritableDraft } from "immer"

interface CartItem {
    images: any
    rating: {
        rate: number,
        count: number
    },
    _id: string,
    id: number,
    title: string,
    price: number,
    description: string,
    category: string,
    image: string,
    orderedQty: number,
    productQtyPrice: number
}

interface CartState {
    cartItems: CartItem[],
    loading: boolean,
    totalAmount: number,
    revision: number
}

const initialState: CartState = {
    cartItems: [],
    loading: false,
    totalAmount: 0,
    revision: 0
}

const cartSlice = createSlice({
    initialState,
    name: "cart",
    reducers: {
        addItem(state, action: PayloadAction<CartItem>) {
            const newItem = action.payload;
            const existingItem = state.cartItems.find(item => item._id === newItem._id);
            if (!existingItem) {
                state.cartItems.push({
                    ...newItem,
                  
                });
            } else {
                existingItem.orderedQty++;
                existingItem.productQtyPrice += newItem.price;

            }
            calculateTotalPrice(state);
            updateCartData(state);
        },

        minusItem(state, action: PayloadAction<CartItem>) {
            const minusedItem = action.payload;

            const existingItem = state.cartItems.find(item => item._id === minusedItem._id);

            if (existingItem) {
                if (existingItem.orderedQty > 1) {
                    existingItem.orderedQty--;
                    existingItem.productQtyPrice -= minusedItem.price;
                } else {
                    state.cartItems = state.cartItems.filter(item => item._id !== minusedItem._id);
                }
            }
            calculateTotalPrice(state);
            updateCartData(state);
        },

        deleteItem(state,action:PayloadAction<CartItem>){
            const deletedItem = action.payload;

            const existingItem = state.cartItems.find(item=>item._id===deletedItem._id);

            if(existingItem){
                state.cartItems = state.cartItems.filter(item=>item._id !== deletedItem._id);
            }
            calculateTotalPrice(state);
            updateCartData(state);
        },

        hydrateCart(state, action) {
            if(state.revision !== action.payload.expectedRevision) return;
            state.cartItems = action.payload.cartData;
            calculateTotalPrice(state);
        },
        setCart(state, action) {
            state.cartItems = action.payload.cartData;
            console.log("CART DATA SET: "+state.cartItems)
            calculateTotalPrice(state)
        },

    }
})

const calculateTotalPrice=(state: WritableDraft<CartState>)=>{
    state.revision++;
    let totalPrice = 0;
    for(let i=0;i<state.cartItems.length;i++){
        totalPrice += state.cartItems[i].productQtyPrice;
    }
    state.totalAmount=parseFloat(totalPrice.toFixed(2));
}

let cartWriteQueue: Promise<void> = Promise.resolve();
export const waitForCartWrites = () => cartWriteQueue;
const updateCartData=async(state: WritableDraft<CartState>)=>{
    const cart=[];
    for(let i=0;i<state.cartItems.length;i++){
        const productId = state.cartItems[i]._id;
        const quantity = state.cartItems[i].orderedQty;

        cart.push({
            productId:productId,
            quantity:quantity
        })
    }

    // Capture the draft before awaiting and persist rapid quantity changes in order.
    const body = JSON.stringify({cart});
    cartWriteQueue = cartWriteQueue.catch(()=>{}).then(async()=>{
        const res=await fetch('/api/cart/updateCart',{method:'POST',headers:{'Content-Type':'application/json'},body});
        const data=await res.json();
        if(!res.ok || !data.success)throw Error('Unable to save bag changes. Please refresh and try again.');
    });
    await cartWriteQueue.catch(()=>{});
}

export const { addItem,setCart,hydrateCart,minusItem,deleteItem } = cartSlice.actions;
export default cartSlice.reducer;
