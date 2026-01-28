import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

function pickEnv(...keys) {
  for (const k of keys) {
    const v = process.env[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

function parseArgs(argv) {
  const args = { image: '', prompt: '这是什么？', model: 'qwen-vl-max', baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1', json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--image' || a === '-i') args.image = argv[i + 1] || '';
    if (a === '--prompt' || a === '-p') args.prompt = argv[i + 1] || args.prompt;
    if (a === '--model' || a === '-m') args.model = argv[i + 1] || args.model;
    if (a === '--baseURL') args.baseURL = argv[i + 1] || args.baseURL;
    if (a === '--json') args.json = true;
  }
  return args;
}

function guessMimeByExt(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.bmp') return 'image/bmp';
  if (ext === '.heic') return 'image/heic';
  return 'image/jpeg';
}

async function toImageUrl(input) {
  if (/^https?:\/\//i.test(input)) return input;
  const buf = await fs.readFile(input);
  const mime = guessMimeByExt(input);
  return `data:${mime};base64,${buf.toString('base64')}`;
}

async function main() {
  const apiKey = pickEnv('AI_VISION_API_KEY', 'DASHSCOPE_API_KEY', 'OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('缺少 API Key，请设置环境变量 AI_VISION_API_KEY（或 DASHSCOPE_API_KEY / OPENAI_API_KEY）');
  }

  const args = parseArgs(process.argv.slice(2));
  const imageInput = args.image || 'https://dashscope.oss-cn-beijing.aliyuncs.com/images/dog_and_girl.jpeg';
  const imageUrl = await toImageUrl(imageInput);

  const url = `${args.baseURL.replace(/\/$/, '')}/chat/completions`;
  const payload = {
    model: args.model,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: imageUrl } },
          { type: 'text', text: args.prompt }
        ]
      }
    ]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data?.error?.message === 'string' ? data.error.message : `HTTP ${res.status}`;
    throw new Error(msg);
  }

  if (args.json) {
    process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
    return;
  }

  const text = data?.choices?.[0]?.message?.content ?? '';
  process.stdout.write(`${typeof text === 'string' ? text : JSON.stringify(text)}\n`);
}

main().catch((err) => {
  process.stderr.write(`${String(err?.message || err)}\n`);
  process.stderr.write('用法: node 视觉模型测试Demo.mjs --image <图片URL或本地路径> --prompt <提问>\n');
  process.stderr.write('示例: node 视觉模型测试Demo.mjs --image https://... --prompt 这是什么？\n');
  process.stderr.write('示例: node 视觉模型测试Demo.mjs --image D:\\\\a.jpg --prompt 识别食物并估算热量\n');
  process.exitCode = 1;
});
