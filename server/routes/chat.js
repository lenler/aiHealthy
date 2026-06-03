import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import express from 'express';
import { Op } from 'sequelize';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { ChatHistory,MealItem} = require('../models/index.cjs');

const Router = express.Router();

const qwen = createOpenAI({
  apiKey: process.env.AI_VISION_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

Router.get('/',async(req,res)=>{
  try{
    const uid = req.userId;

    const chatHistories = await ChatHistory.findAll({
    where: {
        userId: uid,
        createdAt: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      order: [["createdAt", "ASC"]],
      limit: 100,
    });
    const formattedHistories = chatHistories.map(h => ({
      id:h.id,
      role: h.role,
      content: h.content,
      // 前端渲染数据库中的数据必须包含parts
      parts: [{ type: 'text', text: h.content }]
    }));

    res.status(200).json({
        status:true,
        message:'获取聊天记录成功',
        data: formattedHistories // 直接返回数组
    })
  }catch(error){
    res.status(500).json({ status: false, message: '获取聊天记录失败' });
  }
})
Router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCount = await ChatHistory.destroy({
      where: { id, userId: req.userId }
    });
    if (deletedCount === 0) {
      return res.status(404).json({ status: false, message: '消息未找到' });
    }
    res.status(200).json({ status: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ status: false, message: '删除失败，请稍后重试' });
  }
});
Router.post('/', async (req, res) => {
  try {
    if (!process.env.AI_VISION_API_KEY) {
      return res.status(500).json({ error: '缺少环境变量 AI_VISION_API_KEY' });
    }
    const { messages } = req.body;
    const uid = req.userId;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages 必须是一个数组' });
    }
    // 前端发来的消息通常带有 id , createdAt , parts 等字段，如果直接传给模型，模型会因为“看不懂”这些额外字段而报错
    // 后端向ai发送的数据只能包含content role两种信息 因为向后端发送后 会自动生成parts 返回给前端渲染 后端接受信息本质上只接受role content两个信息!!!
    const modelMessages = messages.map((msg) => {
        const role = msg?.role;
        // 兼容处理：用户消息有 content，AI 消息（parts）需要提取 text
        let content = typeof msg?.content === 'string' ? msg.content : '';
        // 如果用户输入不存在 就将content设置为parts中的内容 这一点很重要 这意味着ai具备了完整的上下文记忆
        // 因为用户输入通常是一个字符串 而parts是一个数组 所以需要将parts中的文本合并起来 
        if (!content && Array.isArray(msg?.parts)) {
          content = msg.parts
            .filter((part) => part && part.type === 'text')
            .map((part) => part.text)
            .join('');
        }
        if (!content) {
          return null;
        }
        return { role, content };
      }).filter(Boolean);
    if (modelMessages.length === 0) {
      return res.status(400).json({ error: 'messages 内容为空或格式不正确' });
    }
    // 获取筛查后的最后一条信息并存到数据库中
    const lastMessage=modelMessages[modelMessages.length-1]
    if(lastMessage){
      await ChatHistory.create({
        sessionId: `session-${uid}`,
        userId: uid,
        role: lastMessage.role,
        content: lastMessage.content,
      })
    }
    // 预处理：查询今日饮食数据，注入为 system 上下文
    const date = new Date().toISOString().split('T')[0];
    const todayMeal = await MealItem.findAll({
      where: { userId: uid, date }
    });
    let mealContext;
    if (todayMeal.length === 0) {
      mealContext = '用户今日暂无饮食记录。';
    } else {
      const mealList = todayMeal.map(m =>
        `${m.mealType}: ${m.foodName}, ${m.calories}kcal`
      ).join('；');
      const totalCalories = todayMeal.reduce((sum, m) => sum + m.calories, 0);
      mealContext = `用户今日饮食记录：${mealList}。今日总摄入: ${totalCalories}kcal。`;
    }

    const result = streamText({
      model: qwen('qwen-plus'),
      messages: modelMessages,
      system: `你是一位专业的营养减肥专家，请用简单易懂的语言回答用户问题。${mealContext} 当用户询问饮食状况时，直接基于上述记录分析回答，不要说"让我查一下"之类的话。`,
      // 2. 当 AI 回复完成后，保存 AI 的回复内容
      onFinish: async (event) => {
        try {
          await ChatHistory.create({
            sessionId: `session-${uid}`,
            userId: uid,
            role: 'assistant',
            content: event.text // event.text 是 AI 回复的完整字符串
          });
          // AI reply saved
        } catch (dbError) {
          console.error('保存 AI 回复失败:', dbError);
        }
      }
    });
    result.pipeUIMessageStreamToResponse(res);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});


export default Router;
