import User from "../model/User.js";
import jwt from 'jsonwebtoken'
import trycatch  from "../middlewares/trycatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { reseller } from "googleapis/build/src/apis/reseller/index.js";
import { oauth2Client } from "../config/googleConfig.js";
import axios from "axios";

export const loginUser=trycatch(async(req,res)=>{
    const {code}=req.body;
    
    if(!code){
        res.status(400).json({
            message:"authorization code is required",
        })
    }

    const googleRes = await oauth2Client.getToken(code)

    oauth2Client.setCredentials(googleRes.tokens)

    const userRes=await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`)
    const {email,name,picture}=userRes.data;
        let user=await User.findOne({email})
        if(!user){
            user=await User.create({
                name,
                email,
                image:picture
            });
        }
        const token =jwt.sign({user},process.env.JWT_SEC as string,{
            expiresIn:'30d',
        });
        res.status(200).json({
            message:'Loggin Success',
            token,
            user,
        });
    
});

const allowedRoles=["customer","rider","seller"] as const;
type Role=(typeof allowedRoles)[number];

export const addUserRole=trycatch(async(req:AuthenticatedRequest,res)=>{
    if(!req.user?._id){
        return res.status(500).json({
            message:"unauthorized",
        });
    }
    const {role} =req.body as {role:Role};

    if(!allowedRoles.includes(role)){
        return res.status(400).json({
            message:"invalid role",
        });
    }
    
    const user=await User.findByIdAndUpdate(req.user._id,{role},{new:true})

    if(!user){
        return res.status(404).json({
            message:"user not found",
        });
    }

    const token=jwt.sign({user},process.env.JWT_SEC as string,{
        expiresIn:'30d',
    });
    res.json({
        user,
        token
    });
});

export const myProfile=trycatch(async(req:AuthenticatedRequest,res)=>{
    const user=req.user;
    res.json(user);
});