import express from 'express';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import { Op } from 'sequelize';
const require = createRequire(import.meta.url);
const { User } = require('../models/index.cjs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
dotenv.config();
const Router = express.Router();
Router.post('/sign_up',async function (req,res) {
    try{
        const { email, tel, username, nickName, password } = req.body;
        if (!password) {
            throw new Error('密码不能为空');
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const body={
            email,
            tel,
            username,
            nickName, // Fixed: match model field name
            password: hashedPassword, // Fixed: hash password
            role:0
        }
        // 将用户加入表单
        const user=await User.create(body)
        res.status(201).json({
            status:true,
            message:'创建用户成功',
            data:{
                user
            }
        })
    }catch (error) {
        res.status(400).json({
            status:false,
            message:error.message
        })
    }
})
Router.post('/sign_in',async function(req,res){
    try{
        const {username,password}=req.body
        if(!username){
            throw new Error('用户名不能为空')
        }
        if(!password){
            throw new Error('密码不能为空')
        }
        //查询数据库中是否有该用户
        const condition={
            where:{
                // or方法同时查找两个字段
                [Op.or]:[
                    {email:username},
                    {tel:username},
                    {username:username}
                ]
            }
        }
        const user=await User.findOne(condition)
        // 如果没有找到就报错
        if(!user){
            throw new Error('该用户不存在')
        }
        const storedPassword = user.password || '';
        const looksHashed = storedPassword.startsWith('$2');
        let isPasswordValid = false;
        if (looksHashed) {
            isPasswordValid = bcrypt.compareSync(password, storedPassword);
        } else {
            isPasswordValid = password === storedPassword;
            if (isPasswordValid) {
                const hashedPassword = bcrypt.hashSync(password, 10);
                await user.update({ password: hashedPassword });
            }
        }
        if (!isPasswordValid) {
            throw new Error('密码不正确')
        }

        const token = jwt.sign({
            userId:user.id
        },process.env.SECRET,{expiresIn:'30d'})
        res.status(200).json({
            status:true,
            message:'登录成功',
            data:{
                token,
                userId: user.id,
                nickName: user.nickName
            }
        })
    }catch(error){
        console.log('登录失败',error.message)
        res.status(400).json({
            status:false,
            message:error.message
        })
    }
})
export default Router;
