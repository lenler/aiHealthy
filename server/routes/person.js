import express from 'express';
import path from 'path';
import { randomUUID } from 'crypto';
import { createRequire } from 'module';
import { createOssClient, getOssBucket, getOssHost } from '../utils/oss.js';
const require = createRequire(import.meta.url);
const { HealthyInfo, User } = require("../models/index.cjs");
const Router = express.Router();
/**
 * 用户健康信息
 */
Router.get('/healthyInfo/:userId', async (req, res) => {
    const userId = req.params.userId;
    try{
        const healthyInfo=await HealthyInfo.findOne({
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
            where:{
                userId:userId
            }
        })
        if(healthyInfo){
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
    const userId=req.params.userId;
    const {sex,age,height,weight,bodyStatus}=req.body;
    try{
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
    const id=req.params.userId;
    if(!id){
        return res.status(400).json({
            status:false,
            message:'用户ID不能为空'
        })
    }
    try{
        const account=await User.findOne({
            where:{
                id:id
            }
        })
        if(!account){
            return res.json({
                code:404,
                msg:'用户账号不存在'
            })
        }
        const { username, tel, email, nickName, avatarUrl } = account;
        res.json({
            code:200,
            msg:'用户账号信息查询成功',
            data: {
                username,
                tel,
                email,
                nickName,
                avatarUrl: avatarUrl || ''
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
            where:{
                id:id
            }
        })
        if(account){
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
Router.post("/avatar", async (req, res) => {
    const client = createOssClient();
    if (!client) {
        return res.status(500).json({
            code: 500,
            msg: 'OSS 配置缺失'
        });
    }
    try {
        const fileName = String(req.body?.fileName || 'avatar.png');
        const ext = path.extname(fileName) || '.png';
        const key = `avatars/${randomUUID()}${ext}`;
        const expireAt = new Date(Date.now() + 10 * 60 * 1000);
        const policy = {
            expiration: expireAt.toISOString(),
            conditions: [
                ['content-length-range', 0, 5 * 1024 * 1024],
                { bucket: getOssBucket() },
                ['eq', '$key', key]
            ]
        };
        const formData = await client.calculatePostSignature(policy);
        const host = getOssHost();
        res.json({
            code: 200,
            msg: '获取OSS上传签名成功',
            data: {
                host,
                key,
                policy: formData.policy,
                signature: formData.Signature,
                accessid: formData.OSSAccessKeyId,
                successActionStatus: '200',
                expire: Math.floor(expireAt.getTime() / 1000),
                url: `${host}/${key}`
            }
        });
    } catch (err) {
        res.status(500).json({
            code: 500,
            msg: '获取OSS签名失败',
            err: err.message
        });
    }
});

Router.put('/avatar/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { avatarUrl, avatarObjectKey } = req.body || {};
    if (!userId) {
        return res.status(400).json({
            code: 400,
            msg: '用户ID不能为空'
        });
    }
    if (!avatarUrl || !avatarObjectKey) {
        return res.status(400).json({
            code: 400,
            msg: '头像信息不完整'
        });
    }
    try {
        const account = await User.findOne({ where: { id: userId } });
        if (!account) {
            return res.status(404).json({
                code: 404,
                msg: '用户账号不存在'
            });
        }
        await account.update({
            avatarUrl,
            avatarObjectKey,
            avatarUpdatedAt: new Date()
        });
        return res.json({
            code: 200,
            msg: '头像更新成功',
            data: {
                avatarUrl,
                avatarObjectKey
            }
        });
    } catch (err) {
        return res.status(500).json({
            code: 500,
            msg: '头像更新失败',
            err: err.message
        });
    }
});
export default Router;
