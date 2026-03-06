import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import trycatch from "../middlewares/trycatch.js";
import Address from "../models/Address.js";
import Cart from "../models/Cart.js";
import { IMenuItem } from "../models/MenuItems.js";
import Restaurant, { IRestaurant } from "../models/Restaurant.js";
import Order from "../models/Order.js";

export const createOrder=trycatch(async(req:AuthenticatedRequest,res)=>{
    const user=req.user;
    if(!user){
        return res.status(401).json({
            message:"Unauthorized",
        })
    }

    const {paymentMethod,addressId,distance}=req.body;
    if(!addressId){
        return res.status(400).json({
            message:"Address is required"
        })
    }

    const address=await Address.findOne({
        userId:user._id,//this maybe shoul have been (addressId and not user._id)
        //probably shu=ould add this line (_id:addressId) also
    })

    if(!address){
        return res.status(404).json({
            message:"Address not found"
        })
    }
    const cartItems=await Cart.find({
        userId:user._id
    }).
    populate<{itemId:IMenuItem}>("itemId").
    populate<{restaurantId:IRestaurant}>("restaurantId")

    if(cartItems.length===0){
        return res.status(400).json({
            message:"Cart is Empty"
        })
    }
    const firstCartItem=cartItems[0];
    if(!firstCartItem || !firstCartItem.restaurantId){
        return res.status(400).json({
            message:"invalid cart data"
        })
    }

    const restaurantId=firstCartItem.restaurantId._id;

    const restaurant=await Restaurant.findById(restaurantId)
    if(!restaurant){
        return res.status(404).json({
            message:"No restaurant with this ID"
        })
    }

    if(!restaurant.isOpen){
        return res.status(404).json({
            message:"Sorry this restaurant is closed"
        })
    }

    let subtotal=0;
    const orderItems=cartItems.map((cart)=>{
        const item=cart.itemId;
        if(!item){
            throw new Error("Invalid cart item")
        }
        const itemTotal=item.price*cart.quantity
        subtotal+=itemTotal;
        return {
            itemId:item._id.toString(),
            name:item.name,
            price:item.price,
            quantity:cart.quantity,
        }
    })

    const deliveryFee=subtotal<250?49:0;
    const platformFee=19;
    const totalAmount=subtotal+deliveryFee+platformFee;

    const expiresAt=new Date(Date.now()+15*60*1000);
    const [longitude,latitude]=address.location.coordinates;
    const riderAmount=Math.ceil(distance)*17
    const order=await Order.create({
        userId:user._id.toString(),
        restaurantId:restaurantId.toString(),
        restaurantName:restaurant.name.toString(),
        riderId:null,
        distance,
        riderAmount,
        items:orderItems,
        subtotal,
        deliveryFee,
        totalAmount,
        platformFee,
        addressId:address._id.toString(),
        deliveryAddress:{
            formattedAddress:address.formattedAddress,
            mobile:address.mobile,
            latitude,
            longitude,
        },
        paymentMethod,
        paymentStatus:"pending",
        status:"placed",
        expiresAt,
    });

    await Cart.deleteMany({userId:user._id})

    res.json({
        message:"Order Created Succesfully",
        orderId:order._id.toString(),
        amount:totalAmount
    })
});

export const fetchOrderForPayment=trycatch(async(req,res)=>{
    if(req.headers["x-internal-key"]!==process.env.INTERNAL_SERVICE_KEY){
        return res.status(403).json({
            message:"Forbidden"
        })
    }

    const order=await Order.findById(req.params.id)
    if(!order){
        return res.status(404).json({
            message:"Order not found",
        })
    }

    if(order.paymentStatus!=="pending"){
        return res.status(400).json({
            message:"Order already paid"
        })
    }

    res.json({
        orderId:order._id,
        amount:order.totalAmount,
        currency:"INR"
    })
})