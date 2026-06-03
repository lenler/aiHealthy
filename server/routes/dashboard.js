import express from "express";
import OpenAI from "openai";
import { createRequire } from "module";
import { applyPrivateCache } from "../middleware/cache.js";
import { normalizeMealType } from "../utils/meal.js";
const require = createRequire(import.meta.url);
const { MealItem, HealthyInfo } = require("../models/index.cjs");
const Router = express.Router();

/**
 * 1.获取首页综合数据
 */
Router.get("/:userId", applyPrivateCache(30), async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date().toISOString().split("T")[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split("T")[0];

    const [todayMeal, yesterdayMeal, healthyInfo] = await Promise.all([
      MealItem.findAll({ where: { userId, date: today }, limit: 50 }),
      MealItem.findAll({ where: { userId, date: yesterday }, limit: 50 }),
      HealthyInfo.findOne({ where: { userId }, order: [["updatedAt", "DESC"]] }),
    ]);

    const formatMeals = (meals) => {
      const getMeal = (type) => {
        const meal = meals.find(
          (m) => m.mealType && m.mealType.toLowerCase() === type,
        );
        return meal
          ? {
              name: meal.foodName || "",
              calories: meal.calories || 0,
              img: meal.imgUrl || "",
            }
          : { name: "", calories: 0, img: "" };
      };
      return {
        breakfast: getMeal("breakfast"),
        lunch: getMeal("lunch"),
        dinner: getMeal("dinner"),
      };
    };

    let targetCalories = 2000;
    if (healthyInfo && healthyInfo.weight && healthyInfo.height && healthyInfo.age) {
      const { weight, height, age, sex } = healthyInfo;
      let bmr = 10 * weight + 6.25 * height - 5 * age;
      bmr += sex === 1 ? 5 : -161;
      targetCalories = Math.round(bmr * 1.2);
    }

    const data = {
      todayRecord: {
        date: today,
        meals: formatMeals(todayMeal),
      },
      yesterdayRecord: {
        date: yesterday,
        meals: formatMeals(yesterdayMeal),
      },
      summary: {
        calories: {
          current: todayMeal.reduce((acc, cur) => acc + cur.calories, 0),
          target: targetCalories,
          unit: "kcal",
        },
      },
    };

    return res.status(200).json({
      status: true,
      message: "查询成功",
      data,
    });
  } catch (error) {
    console.error("查询记录失败", error.message);
    res.status(500).json({ status: false, message: "查询失败，请稍后重试" });
  }
});
Router.put("/:userId", async (req, res) => {
  try {
    const userId = req.userId;
    const { foodName, calories, mealType } = req.body;
    if (!foodName) {
      return res.status(400).json({
        status: false,
        message: "食物名称不能为空",
      });
    }
    if (!calories) {
      return res.status(400).json({
        status: false,
        message: "卡路里不能为空",
      });
    }
    if (!mealType) {
      return res.status(400).json({
        status: false,
        message: " mealType不能为空",
      });
    }
    const normalizedMealType = normalizeMealType(mealType);
    const condition = {
      userId,
      date: new Date().toISOString().split("T")[0],
      mealType: normalizedMealType,
    };
    await MealItem.update(
      {
        foodName,
        calories,
        mealType: normalizedMealType,
      },
      {
        where: condition,
      },
    );
    return res.status(200).json({
      status: true,
      message: "更新成功",
    });
  } catch (error) {
    console.error("更新失败", error.message);
    res.status(500).json({ status: false, message: "更新失败，请稍后重试" });
  }
});
Router.delete("/:userId", async (req, res) => {
  try {
    const userId = req.userId;
    const mealType = req.body.mealType || req.query.mealType;
    const normalizedMealType = normalizeMealType(mealType);
    if (!normalizedMealType) {
      return res.status(400).json({
        status: false,
        message: "mealType不能为空",
      });
    }
    const condition = {
      userId,
      date: new Date().toISOString().split("T")[0],
      mealType: normalizedMealType,
    };
    await MealItem.destroy({
      where: condition,
    });
    return res.status(200).json({
      status: true,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除失败", error.message);
    res.status(500).json({ status: false, message: "删除失败，请稍后重试" });
  }
});
Router.post("/:userId", async (req, res) => {
  try {
    const userId = req.userId;
    const { foodName, calories, mealType } = req.body;
    if (!foodName) {
      return res.status(400).json({
        status: false,
        message: "食物名称不能为空",
      });
    }
    if (!calories) {
      return res.status(400).json({
        status: false,
        message: "卡路里不能为空",
      });
    }
    if (!mealType) {
      return res.status(400).json({
        status: false,
        message: " mealType不能为空",
      });
    }
    const normalizedMealType = normalizeMealType(mealType);
    const condition = {
      userId,
      date: new Date().toISOString().split("T")[0],
      mealType: normalizedMealType,
    };
    const existingItem = await MealItem.findOne({
      where: condition,
    });
    if (existingItem) {
      return res.status(400).json({
        status: false,
        message: "该餐次已存在",
      });
    }
    await MealItem.create({
      foodName,
      calories,
      mealType: normalizedMealType,
      userId: userId,
      date: new Date().toISOString().split("T")[0],
    });
    return res.status(200).json({
      status: true,
      message: "添加成功",
    });
  } catch (error) {
    console.error("添加失败", error.message);
    res.status(500).json({ status: false, message: "添加失败，请稍后重试" });
  }
});

// 因为deepseek不支持结构化数据 所以这里我们不使用aisdk来调用deepseek 而是使用open+阿里云提供的qwen3模型
const openai = new OpenAI({
  apiKey: process.env.AI_VISION_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

Router.get("/advice/:userId", applyPrivateCache(30), async (req, res) => {
  const userId = req.userId;
  try {
    const healthyInfo = await HealthyInfo.findOne({
      where: { userId },
      //这里我们只取最新的一条记录 之前出错误是因为我们在这里直接使用的date字段 但是表中没有这个字段
      order: [["updatedAt", "DESC"]],
    });
    if (!healthyInfo) {
      // 如果没有检查到信息 就用保底
      return res.status(200).json({
        status: true,
        message: "未找到健康信息，返回通用建议",
        data: {
          advice: ["多吃蔬菜水果", "保持饮食均衡", "适量运动"],
          targetCalories: 2000,
        },
      });
    }
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `你是一个专业的健康助手。你的任务是根据用户的健康信息生成健康饮食建议。
                    你必须输出 JSON 格式的数据，并且只输出 JSON。
                    不要输出任何解释、Markdown 格式、代码块标记或换行前后的多余文本。
                    输出必须严格符合以下 JSON 结构:
                    {
                        "advice": ["建议1", "建议2", "建议3"],
                        "targetCalories": 2000
                    }
                    其中 advice 是一个包含3条建议的字符串数组，每条建议不超过20字；
                    targetCalories 是根据用户情况推荐的每日目标摄入卡路里数值（整数）。`,
        },
        {
          role: "user",
          content: `用户的健康信息如下: ${JSON.stringify(healthyInfo)}。请生成建议。`,
        },
      ],
      model: "qwen-flash",
      response_format: {
        type: "json_object",
      },
    });
    const content = completion.choices[0].message.content;
    let result;
    try {
      result = JSON.parse(content);
    } catch (e) {
      console.error("JSON解析失败", e);
      // 兜底数据
      result = {
        advice: ["多吃蔬菜水果", "保持饮食均衡", "适量运动"],
        targetCalories: 2000,
      };
    }

    return res.status(200).json({
      status: true,
      message: "获取建议成功",
      data: result,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: "获取建议失败",
    });
  }
});
export default Router;
/* 
{
    advice:["建议1","建议2","建议3"]
}
*/
