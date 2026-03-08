import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import trycatch from "../middlewares/trycatch.js";
import Address from "../models/Address.js";
import Cart from "../models/Cart.js";
import { IMenuItem } from "../models/MenuItems.js";
import Restaurant, { IRestaurant } from "../models/Restaurant.js";
import Order from "../models/Order.js";
import axios from "axios";

export const createOrder=trycatch(async(req:AuthenticatedRequest,res)=>{
    const user=req.user;
    if(!user){
        return res.status(401).json({
            message:"Unauthorized",
        })
    }

    const {paymentMethod,addressId}=req.body;
    if(!addressId){
        return res.status(400).json({
            message:"Address is required"
        })
    }


    const address=await Address.findOne({
        _id:addressId,
        userId:user._id,
        //this maybe shoul have been (addressId and not user._id)
        //probably shu=ould add this line (_id:addressId) also
    })

    if(!address){
        return res.status(404).json({
            message:"Address not found"
        })
    }

    const getDistanceKm=(lat1:number,lon1:number,lat2:number,lon2:number):number=>{
    const R=6371;
    const dlat=((lat2-lat1)*Math.PI)/180;
    const dlon=((lon2-lon1)*Math.PI)/180;

    const a=Math.sin(dlat/2)*Math.sin(dlat/2)+Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*Math.sin(dlon/2)*Math.sin(dlon/2)
    const c=Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
    return +(R*c).toFixed(2)
  };

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

    const distance=getDistanceKm(
            address.location.coordinates[1],
            address.location.coordinates[0],
            restaurant.autoLocation.coordinates[1],
            restaurant.autoLocation.coordinates[0]
          )

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


export const fetchRestaurantOrders=trycatch(async(req:AuthenticatedRequest,res)=>{
    const user=req.user;
    const {restaurantId}=req.params;
    if(!user){
        return res.status(401).json({
            message:"unauthorized"
        })
    }
    if(!restaurantId){
        return res.status(400).json({
            message:"restaurantID is required",
        })
    }
    const limit=req.query.limit ? Number(req.query.limit) : 0;
    const orders=await Order.find({restaurantId,paymentStatus:"paid"}).sort({createdAt:-1}).limit(limit);

    return res.json({
        success:true,
        count:orders.length,
        orders
    })
})

const ALLOWED_STATUSES=["accepted","preparing","ready_for_rider"] as const;

export const updateOrderStatus=trycatch(async(req:AuthenticatedRequest,res)=>{
    const user=req.user;
    const {orderId}=req.params;
    const {status}=req.body;

    if(!user){
        return res.status(401).json({
            message:"Unauthorized",
        })
    }
    if(!ALLOWED_STATUSES.includes(status)){
        return res.status(400).json({
            message:"Invalid Order Status",
        })
    }
    const order=await Order.findById(orderId)
    if(!order){
        return res.status(404).json({
            message:"Order not found",
        })
    }
    if(order.paymentStatus!=="paid"){
        return res.status(404).json({
            message:"Order not completed"
        })
    }
    const restaurant =await Restaurant.findById(order.restaurantId)
    if(!restaurant){
        return res.status(404).json({
            message:"Restaurant not found",
        })
    }
    if(restaurant.ownerId!==user._id.toString()){
        return res.status(401).json({
            message:"you are not allowed to update this order"
        })
    }
    order.status=status;
    await order.save()
    await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,{
        event:"order:update",
        room:`user:${order.userId}`,
        payload:order._id,
        status:order.status
    },{
        headers:{
            "x-internal-key":process.env.INTERNAL_SERVICE_KEY
        }
    })

    //now have to assign riders code left
    res.json({
        message:"order status updated succesfully",
        order
    })
})


export const getMyOrders=trycatch(async(req:AuthenticatedRequest,res)=>{
    if(!req.user){
        return res.status(401).json({
            message:"Unauthorize"
        })
    }
    const orders=await Order.find({
        userId:req.user._id.toString(),
        paymentStatus:"paid"
    }).sort({createdAt:-1})
    res.json({orders})
})

export const fetchSingleOrder=trycatch(async(req:AuthenticatedRequest,res)=>{
    if(!req.user){
        return res.status(401).json({
            message:"Unauthorized"
        })
    }
    const order=await Order.findById(req.params.id);
    if(!order){
        return res.status(401).json({
            message:"Order not found"
        })
    }
    if(order.userId!==req.user._id.toString()){
        
    }
})