import { streamText, convertToModelMessages,tool } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import express from 'express';
import dotenv from 'dotenv';
import { Op } from 'sequelize';
import { createRequire } from 'module';
import { z } from 'zod';
const require = createRequire(import.meta.url);
const { ChatHistory,MealItem} = require('../models/index.cjs');

dotenv.config();
const Router = express.Router();
const deepseek = createDeepSeek({
  apiKey: process.env.AI_GATEWAY_API_KEY,
});
Router.get('/',async(req,res)=>{
  try{
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: '缺少 userId 参数' });
    }
    const uid = parseInt(userId, 10);
    if (isNaN(uid)) {
      return res.status(400).json({ error: 'userId 必须是数字' });
    }

    const chatHistories = await ChatHistory.findAll({
    where: {
        userId: uid,
        createdAt: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
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
    res.status(400).json({
        status:false,
        message:error.message
    })
  }
})
Router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCount = await ChatHistory.destroy({
      where: { id: id }
    });
    if (deletedCount === 0) {
      return res.status(404).json({ status: false, message: '消息未找到' });
    }
    res.status(200).json({ status: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

Router.post('/', async (req, res) => {
  try {
    if (!process.env.AI_GATEWAY_API_KEY) {
      return res.status(500).json({ error: '缺少环境变量 AI_GATEWAY_API_KEY' });
    }
    const { messages, userId } = req.body;
    // console.log(messages);
    
    if (!userId) {
      return res.status(400).json({ error: '缺少 userId 参数' });
    }
    const uid = parseInt(userId, 10);
    if (isNaN(uid)) {
      return res.status(400).json({ error: 'userId 必须是数字' });
    }
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
        sessionId: 'session-001',
        userId: uid,
        role: lastMessage.role,
        content: lastMessage.content,
      })
    }else{
      console.log('最后一条信息为空')
    }
    const result = streamText({
      model: deepseek('deepseek-chat'),
      messages: modelMessages,
      system: '你是一位专业的营养减肥专家。请用简单易懂、通俗的语言回答用户关于营养和减肥的问题。回答要言简意赅，避免长篇大论，重点突出实用建议。如果用户询问今天的饮食状况、营养摄入或需要饮食建议，请务必先调用 mealInfoAnalysis 工具获取用户今日的饮食记录，然后根据记录进行分析。不要直接问用户吃了什么，除非工具返回的记录为空。',
      tools: {
        mealInfoAnalysis: tool({
          description: '获取用户今日的饮食记录以分析营养摄入。当用户询问“我今天吃得怎么样”、“分析今日饮食”等相关问题时调用此工具。',
          inputSchema: z.object({
            mealInfo: z
              .string()
              .describe('The user\'s meal information'),
          }),
          execute: async () => {
            const date = new Date().toISOString().split('T')[0];
            const todayMeal = await MealItem.findAll({
              where: {
                userId: uid,
                date: date
              }
            });
            return {
              todayMeal,
            };
          },
        })
      },
      // 2. 当 AI 回复完成后，保存 AI 的回复内容
      onFinish: async (event) => {
        try {
          await ChatHistory.create({
            sessionId: 'session-default',
            userId: uid,
            role: 'assistant',
            content: event.text // event.text 是 AI 回复的完整字符串
          });
          console.log('AI 回复已保存到数据库');
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
