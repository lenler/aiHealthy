import express from 'express';
import dotenv from 'dotenv';//用来加载环境变量的中间件
import path from 'path';//处理路径的中间件
import fs from 'fs';//处理文件读取的中间件
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const multer = require('multer');//用来处理文件上传的中间件
const { MealItem } = require('../models/index.cjs');
dotenv.config();
/**
 * 所有辅助函数
 * @param {*} type 
 * @returns 
 */
// 格式转换 避免前端传入小写字母导致请求不能通过数据库模型验证
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
const formatMeals = (meals) => {
    const getMeal = (type) => {
        const meal = meals.find(m => m.mealType && m.mealType.toLowerCase() === type);
        return meal ? {
            name: meal.foodName || '',
            calories: meal.calories || 0,
            img: meal.imgUrl || ''
        } : { name: '', calories: 0, img: '' };
    };
    return {
        breakfast: getMeal('breakfast'),
        lunch: getMeal('lunch'),
        dinner: getMeal('dinner')
    };
};
// 配置 multer 存储 
// 拼接上传文件保存目录：项目根目录/public/uploads
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
// 递归创建目录（若不存在）
fs.mkdirSync(uploadDir, { recursive: true });
// 配置 multer 磁盘存储规则
const storage = multer.diskStorage({
    // 文件保存路径
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    // 生成唯一文件名：字段名-时间戳-随机数.原扩展名
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });
const Router = express.Router();

/**
 * 上传图片
 */
Router.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: false, message: '未上传文件' });
        }
        //临时将图片存储到文件夹中 后续会直接发送给ai
        const fileUrl = `/uploads/${req.file.filename}`;
        return res.status(200).json({
            status: true,
            message: '上传成功',
            url: fileUrl
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
});

/**
 * 1.获取首页综合数据
 */
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
        const {foodName,calories,mealType}=req.body
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
            mealType:normalizedMealType
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
        const {foodName,calories,mealType}=req.body
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
            date:new Date().toISOString().split('T')[0]
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
