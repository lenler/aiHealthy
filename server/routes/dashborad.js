import express from 'express';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import { Op } from 'sequelize';
const require = createRequire(import.meta.url);
const { User, Record,MealItem } = require('../models/index.cjs');
dotenv.config();
const Router = express.Router();
/**
 * 1.获取首页综合数据
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
export default Router