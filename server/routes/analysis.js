import express from 'express';
import dotenv from 'dotenv';//用来加载环境变量的中间件
import path from 'path';//处理路径的中间件
import { randomUUID } from 'crypto';
import { createRequire } from 'module';
import OpenAI from 'openai';
import { createOssClient, getOssHost } from '../utils/oss.js';
const require = createRequire(import.meta.url);
const multer = require('multer');//用来处理文件上传的中间件
const { MealItem } = require('../models/index.cjs');
dotenv.config();
/**
 * 所有辅助函数 格式转换 避免前端传入小写字母导致请求不能通过数据库模型验证
 * @param {*} type 
 * @returns 
 */
function normalizeMealType(type){
    if(!type){
        return type
    }
    const t=type.toLowerCase()
    if(t==='breakfast'){
        return 'Breakfast'
    }
    if(t==='lunch'){
        return 'Lunch'
    }
    if(t==='dinner'){
        return 'Dinner'
    }
    if(t==='snack'){
        return 'Snack'
    }
    return type
}
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype || !file.mimetype.startsWith('image/')) {
            return cb(new Error('仅支持图片上传'));
        }
        cb(null, true);
    }
});
// 初始化视觉模型
const openai=new OpenAI({
    apiKey: process.env.AI_VISION_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
})
/**
 * 各个路由配置
 */
const Router = express.Router();
Router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: false, message: '未上传文件' });
        }
        const client = createOssClient();
        if (!client) {
            return res.status(500).json({ status: false, message: 'OSS配置缺失' });
        }
        const ext = path.extname(req.file.originalname || '') || '.jpg';
        const objectKey = `meal-images/${randomUUID()}${ext}`;
        await client.put(objectKey, req.file.buffer, {
            headers: {
                'Content-Type': req.file.mimetype || 'image/jpeg'
            }
        });
        const fileUrl = `${getOssHost()}/${objectKey}`;
        const mimeType = req.file.mimetype || 'image/jpeg';
        const imageDataUrl = `data:${mimeType};base64,${req.file.buffer.toString('base64')}`;
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
        // 解析ai返回的json数据
        const content = response?.choices?.[0]?.message?.content;
        const json = typeof content === 'string' ? JSON.parse(content) : content;
        // 从json中提取items数组 并处理空数组情况
        const rawItems = Array.isArray(json?.items) ? json.items : [];
        // 对items数组进行映射处理 处理空值情况
        const items = rawItems.map((item, idx) => {
            const key = String(idx + 1);
            const foodName = item?.foodName
            const calories = Number(item?.calories)
            return { key, foodName, calories };
        });
        // 处理空数组情况 确保items至少包含一个元素
        const safeItems = items.length ? items : [{ key: '1', foodName: '未知', calories: 0,img:'' }];
        return res.status(200).json({
            status:true,
            message:'识别成功',
            data:{
                // 上传的图片url
                url: fileUrl,
                items: safeItems
            }
        })
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
});
Router.post('/dashborad/:userId',async(req,res)=>{
    try{
        const userId=req.params.userId
        const date=req.body.currentDate || new Date().toISOString().split('T')[0]
        const todayMeal=await MealItem.findAll({
            where:{
                userId:userId,
                date: date
            }
        })
        const data=todayMeal
        return res.status(200).json({
            status:true,
            message:'查询成功',
            data
        })
    }catch(error){
        console.log('查询记录失败',error.message)
        res.status(400).json({
            status:false,
            message:error.message
        })
    }
})
Router.put('/:userId',async(req,res)=>{
    try{
        const userId=req.params.userId
        const {foodName,calories,mealType,imgUrl}=req.body
        if(!userId){
            return res.status(400).json({
                status:false,
                message:'用户ID不能为空'
            })
        }
        if(!foodName){
            return res.status(400).json({
                status:false,
                message:'食物名称不能为空'
            })
        }
        if(!calories){
            return res.status(400).json({
                status:false,
                message:'卡路里不能为空'
            })
        }
        if(!mealType){
            return res.status(400).json({
                status:false,
                message:' mealType不能为空'
            })
        }
        const normalizedMealType=normalizeMealType(mealType)
        const condition={
            userId,
            date: new Date().toISOString().split('T')[0],
            mealType:normalizedMealType
        }
        await MealItem.update({
            foodName,
            calories,
            mealType:normalizedMealType,
            imgUrl
        },{
            where:condition
        })
        return res.status(200).json({
            status:true,
            message:'更新成功'
        })
    }catch(error){
        console.log('更新失败',error.message)
        res.status(400).json({
            status:false,
            message:error.message
        })
    }
})
Router.post("/:userId",async(req,res)=>{
        try{
        const userId=req.params.userId
        const {foodName,calories,mealType,imgUrl}=req.body
        if(!userId){
            return res.status(400).json({
                status:false,
                message:'用户ID不能为空'
            })
        }
        if(!foodName){
            return res.status(400).json({
                status:false,
                message:'食物名称不能为空'
            })
        }
        if(!calories){
            return res.status(400).json({
                status:false,
                message:'卡路里不能为空'
            })
        }
        if(!mealType){
            return res.status(400).json({
                status:false,
                message:' mealType不能为空'
            })
        }
        const normalizedMealType=normalizeMealType(mealType)
        const condition={
            userId,
            date: new Date().toISOString().split('T')[0],
            mealType:normalizedMealType
        }
        const existingItem=await MealItem.findOne({
            where:condition
        })
        if(existingItem){
            return res.status(400).json({
                status:false,
                message:'该餐次已存在'
            })
        }
        await MealItem.create({
            foodName,
            calories,
            mealType:normalizedMealType,
            userId:userId,
            date:new Date().toISOString().split('T')[0],
            imgUrl
        })
        return res.status(200).json({
            status:true,
            message:'添加成功'
        })
    }catch(error){
        console.log('添加失败',error.message)
        res.status(400).json({
            status:false,
            message:error.message
        })
    }
})
export default Router
