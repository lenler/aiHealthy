import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { createRequire } from 'module';
import OpenAI from 'openai';
import { normalizeMealType } from '../utils/meal.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const multer = require('multer');
const { MealItem } = require('../models/index.cjs');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'meal-images');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
    storage: multer.diskStorage({
        destination: UPLOAD_DIR,
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname || '') || '.jpg';
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

const openai = new OpenAI({
    apiKey: process.env.AI_VISION_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

const Router = express.Router();

Router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: false, message: '未上传文件' });
        }
        const fileUrl = `/uploads/meal-images/${req.file.filename}`;
        const mimeType = req.file.mimetype || 'image/jpeg';
        const buffer = fs.readFileSync(req.file.path);
        const imageDataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

        const response = await openai.chat.completions.create({
            model: "qwen-vl-max",
            messages: [
                {
                    role: "system",
                    content: "你是一个食物识别助手。你必须输出 JSON(大小写不敏感)并且只输出 JSON,不要输出任何解释、Markdown、代码块、换行前后的多余文本。输出必须严格符合以下结构(字段名必须一致):{ \"items\": [{\"key\":\"1\",\"foodName\":\"香煎三文鱼\",\"calories\":280}] } 规则：1) items 必须是数组，表示图片中识别出的多种食物，按重要程度排序；2) key 必须是字符串且在 items 内唯一（\"1\",\"2\",...）；3) foodName 必须是中文字符串；4) calories 必须是整数(kcal)，不要带单位；5) 如果完全无法判断食物，则返回 {\"items\":[{\"key\":\"1\",\"foodName\":\"未知\",\"calories\":0}]}；6) 不允许输出除 items 之外的额外字段，不允许输出 null。"
                },
                {
                    role: "user",
                    content: [
                        { type: "image_url", image_url: { url: imageDataUrl } },
                        { type: "text", text: "请根据图片识别食物列表并估算每项热量，只输出 JSON。" }
                    ]
                }
            ],
            response_format: { type: 'json_object' }
        });

        const content = response?.choices?.[0]?.message?.content;
        const json = typeof content === 'string' ? JSON.parse(content) : content;
        const rawItems = Array.isArray(json?.items) ? json.items : [];
        const items = rawItems.map((item, idx) => {
            const key = String(idx + 1);
            const foodName = item?.foodName;
            const calories = Number(item?.calories);
            return { key, foodName, calories };
        });
        const safeItems = items.length ? items : [{ key: '1', foodName: '未知', calories: 0, img: '' }];

        return res.status(200).json({
            status: true,
            message: '识别成功',
            data: {
                url: fileUrl,
                items: safeItems
            }
        });
    } catch (error) {
        console.error('AI 识别失败', error.message);
        return res.status(200).json({
            status: true,
            message: '识别失败，返回兜底数据',
            data: {
                url: '',
                items: [{ key: '1', foodName: '未知', calories: 0 }]
            }
        });
    }
});

Router.post('/dashboard/:userId', async (req, res) => {
    try {
        const userId = req.userId;
        const date = req.body.currentDate || new Date().toISOString().split('T')[0];
        const todayMeal = await MealItem.findAll({
            where: { userId, date }
        });
        return res.status(200).json({
            status: true,
            message: '查询成功',
            data: todayMeal
        });
    } catch (error) {
        console.error('查询记录失败', error.message);
        res.status(500).json({ status: false, message: '查询失败' });
    }
});

Router.put('/:userId', async (req, res) => {
    try {
        const userId = req.userId;
        const { foodName, calories, mealType, imgUrl } = req.body;
        if (!foodName) return res.status(400).json({ status: false, message: '食物名称不能为空' });
        if (!calories) return res.status(400).json({ status: false, message: '卡路里不能为空' });
        if (!mealType) return res.status(400).json({ status: false, message: 'mealType不能为空' });

        const normalizedMealType = normalizeMealType(mealType);
        const condition = {
            userId,
            date: new Date().toISOString().split('T')[0],
            mealType: normalizedMealType
        };
        await MealItem.update(
            { foodName, calories, mealType: normalizedMealType, imgUrl },
            { where: condition }
        );
        return res.status(200).json({ status: true, message: '更新成功' });
    } catch (error) {
        console.error('更新失败', error.message);
        res.status(500).json({ status: false, message: '更新失败' });
    }
});

Router.post("/:userId", async (req, res) => {
    try {
        const userId = req.userId;
        const { foodName, calories, mealType, imgUrl } = req.body;
        if (!foodName) return res.status(400).json({ status: false, message: '食物名称不能为空' });
        if (!calories) return res.status(400).json({ status: false, message: '卡路里不能为空' });
        if (!mealType) return res.status(400).json({ status: false, message: 'mealType不能为空' });

        const normalizedMealType = normalizeMealType(mealType);
        const condition = {
            userId,
            date: new Date().toISOString().split('T')[0],
            mealType: normalizedMealType
        };
        const existingItem = await MealItem.findOne({ where: condition });
        if (existingItem) {
            return res.status(400).json({ status: false, message: '该餐次已存在' });
        }
        await MealItem.create({
            foodName,
            calories,
            mealType: normalizedMealType,
            userId,
            date: new Date().toISOString().split('T')[0],
            imgUrl
        });
        return res.status(200).json({ status: true, message: '添加成功' });
    } catch (error) {
        console.error('添加失败', error.message);
        res.status(500).json({ status: false, message: '添加失败' });
    }
});

export default Router;
