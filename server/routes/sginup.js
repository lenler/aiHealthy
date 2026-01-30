import express from 'express'
import bcrypt from 'bcrypt'
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const{User}=require("../models/index.cjs")
const Router=express.Router()

Router.post('/',async (req,res)=>{
    const {username,password,tel,email,nickName}=req.body;
    // 加密密码
    const hashedPassword=await bcrypt.hash(password,10);
    try{
        // 创建用户 验证用户名是否存在
        const existingUser=await User.findOne({
            where:{
                username:username
            }
        })
        if(existingUser){
            return res.json({
                code:400,
                msg:'用户名已存在'
            })
        }
        // 创建用户
        await User.create({
            username,
            password:hashedPassword,
            tel,
            email,
            nickName
        })
        res.json({
            code:200,
            msg:'用户注册成功'
        })
    }catch(err){
        res.json({
            code:500,
            msg:'服务器错误'
        })
    }
})

export default Router