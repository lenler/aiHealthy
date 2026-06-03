import express from 'express';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { User } = require('../models/index.cjs');
const Router = express.Router();

Router.post('/sign_in', async function (req, res) {
    const { username, password } = req.body;
    if (!username) {
        return res.status(400).json({ status: false, message: '用户名不能为空' });
    }
    if (!password) {
        return res.status(400).json({ status: false, message: '密码不能为空' });
    }

    try {
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { email: username },
                    { tel: username },
                    { username: username }
                ]
            }
        });
        if (!user) {
            return res.status(401).json({ status: false, message: '用户名或密码错误' });
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
            return res.status(401).json({ status: false, message: '用户名或密码错误' });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.SECRET,
            { expiresIn: '30d' }
        );
        res.status(200).json({
            status: true,
            message: '登录成功',
            data: {
                token,
                userId: user.id,
                nickName: user.nickName,
                avatarUrl: user.avatarUrl || ''
            }
        });
    } catch (error) {
        console.error('登录失败', error.message);
        res.status(500).json({ status: false, message: '服务器错误，请稍后重试' });
    }
});

export default Router;
