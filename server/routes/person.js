import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const {HealthyInfo,User}=require("../models/index.cjs")
const Router=express.Router();
/**
 * 用户健康信息
 */
Router.get('/healthyInfo/:userId',async(req,res)=>{
    // 获取用户健康信息
    const userId=req.params.userId;
    try{
        const healthyInfo=await HealthyInfo.findOne({
            // 查询数据库中用户健康信息
            where:{
                userId:userId
            }
        })
        if(healthyInfo){
            res.json({
                code:200,
                data:healthyInfo
            })
        }else{
            res.json({
                code:404,
                msg:'用户健康信息不存在',
                data:{}
            })
        }
    }catch(err){
        res.json({
            code:500,
            msg:'服务器错误'
        })
    }
})
// 更新用户健康信息
Router.put('/healthyInfo/:userId',async(req,res)=>{
    // 更新用户健康信息
    const userId=req.params.userId;
    const {sex,age,height,weight,bodyStatus}=req.body;
        if(!userId){
            return res.status(400).json({
                status:false,
                message:'用户ID不能为空'
            })
        }
    try{
        const healthyInfo=await HealthyInfo.findOne({
            // 查询数据库中用户健康信息
            where:{
                userId:userId
            }
        })
        if(healthyInfo){
            // 更新用户健康信息
            await healthyInfo.update({
                sex,
                age,
                height,
                weight,
                bodyStatus
            });
            res.json({
                code:200,
                data:healthyInfo
            })
        }else{
            res.json({
                code:404,
                msg:'用户健康信息不存在'
            })
        }
    }catch(err){
        res.json({
            code:500,
            msg:'服务器错误'
        })
    }
})
Router.post('/healthyInfo/:userId',async(req,res)=>{
    // 更新用户健康信息
    const userId=req.params.userId;
    const {sex,age,height,weight,bodyStatus}=req.body;
    try{
        // 创建用户健康信息
        await HealthyInfo.create({
            userId:userId,
            sex,
            age,
            height,
            weight,
            bodyStatus
        })
        res.json({
            code:200,
            msg:'用户健康信息创建成功'
        })
    }catch(err){
        res.json({
            code:500,
            msg:'服务器错误'
        })
    }
})
/**
 * 用户账号信息
 */
Router.get('/accountInfo/:userId',async(req,res)=>{
    // 获取用户账号信息
    const id=req.params.userId;
    if(!id){
        return res.status(400).json({
            status:false,
            message:'用户ID不能为空'
        })
    }
    try{
        const account=await User.findOne({
            // 查询数据库中用户账号信息
            where:{
                id:id
            }
        })
        const {username,tel,email,nickName}=account;
        if(!account){
            return res.json({
                code:404,
                msg:'用户账号不存在'
            })
        }
        res.json({
            code:200,
            msg:'用户账号信息查询成功',
            data: {
                username,
                tel,
                email,
                nickName
            }
        })
    }catch(err){
        res.json({
            code:500,
            msg:'服务器错误',
            err:err.message
        })
    }
})
// 更新用户账号信息
Router.put('/accountInfo/:userId',async(req,res)=>{
    // 更新用户账号信息 需要对账号做信息验证
    const id=req.params.userId;
    const {username,tel,email,nickName}=req.body;
    if(!id){
        return res.status(400).json({
            status:false,
            message:'用户ID不能为空'
        })
    }
    try{
        const account=await User.findOne({
            // 查询数据库中用户账号信息
            where:{
                id:id
            }
        })
        if(account){
            // 更新用户账号信息
            await account.update({
                username,
                tel,
                email,
                nickName
            });
            res.json({
                code:200,
                msg:'用户账号信息更新成功',
                data:account
            })
        }else{
            res.json({
                code:404,
                msg:'用户账号不存在'
            })
        }
    }catch(err){
        res.json({
            code:500,
            msg:'服务器错误',
            err:err.message
        })
    }
})
export default Router;