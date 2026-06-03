import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { createRequire } from 'module';
import { applyPrivateCache } from '../middleware/cache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const multer = require('multer');
const { HealthyInfo, User } = require("../models/index.cjs");
const Router = express.Router();

const AVATAR_DIR = path.join(__dirname, '..', 'public', 'uploads', 'avatars');
fs.mkdirSync(AVATAR_DIR, { recursive: true });

/**
 * 用户健康信息
 */
Router.get('/healthyInfo/:userId', applyPrivateCache(60), async (req, res) => {
    const userId = req.userId;
    try {
        const healthyInfo = await HealthyInfo.findOne({
            where: { userId }
        });
        if (healthyInfo) {
            res.json({
                status: true,
                message: '查询成功',
                data: healthyInfo
            });
        } else {
            res.status(404).json({
                status: false,
                message: '用户健康信息不存在',
                data: {}
            });
        }
    } catch (err) {
        console.error('查询健康信息失败', err.message);
        res.status(500).json({
            status: false,
            message: '服务器错误'
        });
    }
});

Router.put('/healthyInfo/:userId', async (req, res) => {
    const userId = req.userId;
    const { sex, age, height, weight, bodyStatus } = req.body;
    if (!userId) {
        return res.status(400).json({
            status: false,
            message: '用户ID不能为空'
        });
    }
    try {
        const healthyInfo = await HealthyInfo.findOne({
            where: { userId }
        });
        if (healthyInfo) {
            await healthyInfo.update({ sex, age, height, weight, bodyStatus });
            res.json({
                status: true,
                message: '更新成功',
                data: healthyInfo
            });
        } else {
            res.status(404).json({
                status: false,
                message: '用户健康信息不存在，请先创建'
            });
        }
    } catch (err) {
        console.error('更新健康信息失败', err.message);
        res.status(500).json({
            status: false,
            message: '服务器错误'
        });
    }
});

Router.post('/healthyInfo/:userId', async (req, res) => {
    const userId = req.userId;
    const { sex, age, height, weight, bodyStatus } = req.body;
    if (!userId) {
        return res.status(400).json({
            status: false,
            message: '用户ID不能为空'
        });
    }
    try {
        const info = await HealthyInfo.create({
            userId, sex, age, height, weight, bodyStatus
        });
        res.status(201).json({
            status: true,
            message: '用户健康信息创建成功',
            data: info
        });
    } catch (err) {
        console.error('创建健康信息失败', err.message);
        res.status(500).json({
            status: false,
            message: '服务器错误'
        });
    }
});

/**
 * 用户账号信息
 */
Router.get('/accountInfo/:userId', applyPrivateCache(60), async (req, res) => {
    const id = req.userId;
    try {
        const account = await User.findOne({ where: { id } });
        if (!account) {
            return res.status(404).json({
                status: false,
                message: '用户账号不存在'
            });
        }
        const { username, tel, email, nickName, avatarUrl } = account;
        res.json({
            status: true,
            message: '用户账号信息查询成功',
            data: { username, tel, email, nickName, avatarUrl: avatarUrl || '' }
        });
    } catch (err) {
        console.error('查询账号信息失败', err.message);
        res.status(500).json({
            status: false,
            message: '服务器错误'
        });
    }
});

Router.put('/accountInfo/:userId', async (req, res) => {
    const id = req.userId;
    const { username, tel, email, nickName } = req.body;
    try {
        const account = await User.findOne({ where: { id } });
        if (account) {
            await account.update({ username, tel, email, nickName });
            res.json({
                status: true,
                message: '用户账号信息更新成功',
                data: account
            });
        } else {
            res.status(404).json({
                status: false,
                message: '用户账号不存在'
            });
        }
    } catch (err) {
        console.error('更新账号信息失败', err.message);
        res.status(500).json({
            status: false,
            message: '服务器错误'
        });
    }
});

const avatarUpload = multer({
    storage: multer.diskStorage({
        destination: path.join(__dirname, '..', 'public', 'uploads', 'avatars'),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname || '') || '.png';
            cb(null, `${randomUUID()}${ext}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype || !file.mimetype.startsWith('image/')) {
            return cb(new Error('仅支持图片上传'));
        }
        cb(null, true);
    }
});

Router.post("/avatar", avatarUpload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: false, message: '未上传文件' });
        }
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        return res.json({
            status: true,
            message: '头像上传成功',
            data: { avatarUrl }
        });
    } catch (err) {
        console.error('头像上传失败', err.message);
        return res.status(500).json({ status: false, message: '头像上传失败' });
    }
});

Router.put('/avatar/:userId', async (req, res) => {
    const userId = req.userId;
    const { avatarUrl } = req.body || {};
    if (!userId) {
        return res.status(400).json({ status: false, message: '用户ID不能为空' });
    }
    if (!avatarUrl) {
        return res.status(400).json({ status: false, message: '头像URL不能为空' });
    }
    try {
        const account = await User.findOne({ where: { id: userId } });
        if (!account) {
            return res.status(404).json({ status: false, message: '用户账号不存在' });
        }
        await account.update({
            avatarUrl,
            avatarUpdatedAt: new Date()
        });
        return res.json({
            status: true,
            message: '头像更新成功',
            data: { avatarUrl }
        });
    } catch (err) {
        console.error('头像更新失败', err.message);
        return res.status(500).json({ status: false, message: '头像更新失败' });
    }
});

export default Router;
