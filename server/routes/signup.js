import express from 'express';
import bcrypt from 'bcrypt';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { User } = require("../models/index.cjs");
const Router = express.Router();

Router.post('/', async (req, res) => {
    const { username, password, tel, email, nickName } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            status: false,
            message: '用户名和密码不能为空'
        });
    }

    try {
        const existingUser = await User.findOne({
            where: { username }
        });
        if (existingUser) {
            return res.status(409).json({
                status: false,
                message: '用户名已存在'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            password: hashedPassword,
            tel,
            email,
            nickName
        });
        res.status(201).json({
            status: true,
            message: '用户注册成功',
            data: {
                userId: user.id,
                username: user.username
            }
        });
    } catch (err) {
        console.error('注册失败', err.message);
        res.status(500).json({
            status: false,
            message: '服务器错误'
        });
    }
});

export default Router;
