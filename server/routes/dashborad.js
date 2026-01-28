import express from 'express';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import { Op } from 'sequelize';
const require = createRequire(import.meta.url);
const { User, Record,MealItem } = require('../models/index.cjs');
dotenv.config();
const Router = express.Router();
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
/**
 * 1.获取首页综合数据
 *{
    breakfast: { name:string,calories:number},
    lunch: { name:string,calories:number},
    dinner: { name:string,calories:number}
 * } 
 */
Router.get('/:userId',async(req,res)=>{
    try{
        const userId=req.params.userId
        const today = new Date().toISOString().split('T')[0]
        const yesterdayDate = new Date()
        yesterdayDate.setDate(yesterdayDate.getDate() - 1)
        const yesterday = yesterdayDate.toISOString().split('T')[0]
        const todayMeal=await MealItem.findAll({
            where:{
                userId:userId,
                date: today
            }
        })
        
        const yesterdayMeal=await MealItem.findAll({
            where:{
                userId:userId,
                date: yesterday
            }
        })

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

        const data={
            // 死数据 模拟数据
            summary:{
                carbs: { current: 50, target: 120, unit: 'g' },
                protein: { current: 70, target: 100, unit: 'g' },
                fat: { current: 25, target: 40, unit: 'g' },
                calories: { current: 900, target: 2000, unit: 'kcal' },
                totalIntake: 1200
            },
            todayRecord:{
                date:today,
                meals: formatMeals(todayMeal)
            },
            yesterdayRecord:{
                date:yesterday,
                meals: formatMeals(yesterdayMeal)
            }
        }
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

Router.delete('/:userId',async(req,res)=>{
    try{
        const userId=req.params.userId
        const mealType = req.body.mealType || req.query.mealType
        if(!userId){
            return res.status(400).json({
                status:false,
                message:'用户ID不能为空'
            })
        }
        const normalizedMealType=normalizeMealType(mealType)
        if(!normalizedMealType){
            return res.status(400).json({
                status:false,
                message:'mealType不能为空'
            })
        }
        const condition={
            userId,
            date: new Date().toISOString().split('T')[0],
            mealType:normalizedMealType
        }
        await MealItem.destroy({
            where:condition
        })
        return res.status(200).json({
            status:true,
            message:'删除成功'
        })
    }catch(error){
        console.log('删除失败',error.message)
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
