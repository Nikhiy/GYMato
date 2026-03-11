import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import trycatch from "../middlewares/trycatch.js";
import { Rider } from "../model/Rider.js";

export const addRiderProfile=trycatch(async(req:AuthenticatedRequest,res)=>{
    const user=req.user;
    if(!user){
        return res.status(401).json({
            message:"Unauthorized",
        })
    }
    if(user.role!=="rider"){
        return res.status(404).json({
            message:"Only riders can create a rider profile"
        })
    }
    const file=req.file;
    if(!file){
        return res.status(400).json({
            message:"Fill all the requireed details correctly"
        })
    }
    const fileBuffer=getBuffer(file)
    if(!fileBuffer?.content){
        return res.status(500).json({
            message:"Failed to generate image buffer"
        })
    }
    const {data:uploadResult}=await axios.post(`${process.env.UTILS_SERVICE}/api/upload`,{
        buffer:fileBuffer.content,
    })
    const {phoneNumber,aadharNumber,drivingLicenseNumber,latitude,longitude}=req.body
    if(!phoneNumber || !aadharNumber || !drivingLicenseNumber || latitude===undefined || longitude===undefined){
        return res.status(400).json({
            message:"All fields are required"
        })
    }
    const existingProfile=await Rider.findOne({
        userId:user._id,
    })
    if(existingProfile){
        return res.status(400).json({
            message:"Rider profile already exists",
        })
    }
    const riderProfile=await Rider.create({
        userId:user._id,
        picture:uploadResult.url,
        phoneNumber,
        aadharNumber,
        drivingLicenseNumber,
        location:{
            type:"Point",
            coordinates:[longitude,latitude],
        },
        isAvailable:false,
        isVerified:false,
    })
    return res.status(200).json({
        message:"Rider profile created s1ccesfully",
        riderProfile
    })
})


export const fetchMyProfile=trycatch(async(req:AuthenticatedRequest,res)=>{
    const user=req.user;
    if(!user){
        return res.status(401).json({
            message:"Unauthorized",
        })
    }

    const account=await Rider.findOne({
        userId:user._id
    })
    res.json(account);
})

export const toggleRiderAvailability=trycatch(async(req:AuthenticatedRequest,res)=>{
    const user=req.user;
    if(!user){
        return res.status(401).json({
            message:"Unauthorized",
        })
    }
    if(user.role!=="rider"){
        return res.status(404).json({
            message:"Only riders can access this feature"
        })
    }
    const {isAvailable,latitude,longitude}=req.body;
    if(typeof isAvailable!=="boolean"){
        return res.status(400).json({
            message:"isAvailable must be boolean"
        })
    }
    if(latitude === undefined || longitude === undefined){
        return res.status(400).json({
            message:"latitue and longitude must be valid points",
        })
    }
    const rider=await Rider.findOne({
        userId:user._id,
    })
    if(!rider){
        return res.status(404).json({
            message:"Rider not found",
        })
    }
    if(isAvailable && !rider.isVerified){
        return res.status(403).json({
            message:"Rider is not verified",
        })
    }
    rider.isAvailable=isAvailable
    rider.location={
        type:"Point",
        coordinates:[longitude,latitude]
    }
    rider.lastActiveAt=new Date()
    await rider.save();
    res.json({
        message: isAvailable? "Rider is now online":"Rider is now offline",
        rider
    })
})
