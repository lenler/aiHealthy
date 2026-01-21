import Mock from 'mockjs'
const mockUsers = [
  {
    id: 1,
    username: '13800138000',
    email: 'test@example.com',
    password: 'Test@123',
    nickname: '健康达人',
    avatar: ''
  },
  {
    id: 2,
    username: '13912345678',
    email: 'healthy@test.com',
    password: 'Health@2024',
    nickname: '运动爱好者',
    avatar: ''
  },
  {
    id: 3,
    username: '18688888888',
    email: 'user@test.com',
    password: 'User@8888',
    nickname: '养生专家',
    avatar: ''
  },
  {
    id: 4,
    username: 'admin',
    email: 'admin@test.com',
    password: '123123',
    nickname: '管理员',
    avatar: ''
  }
];

// 登录接口
Mock.mock('https://localhost:8080/login', 'post', (req:any) => {
  console.log('req',req);
  
  const { username, password } = JSON.parse(req.body);
  // 在数据库中查询用户
  const user = mockUsers.find(u => u.username === username || u.email === username);
  if (!user) {
    return {
      code: 404,
      message: '用户不存在',
      data: null
    }
  }
  //简单在mock中做一个登录验证 登录成功后返回token
  if (user.password === password) {
    return {
      code: 200,
      message: '登录成功',
      data: {
        nickname: user.nickname,
        token: username + password,
      }
    }
  } else {
    return {
      code: 401,
      message: '用户名或密码有误',
      data: {
        nickname: user.nickname,
        token: username + password
      }
    }
  }
})

// 首页数据接口
/* 
  1.数据总: 碳水摄入量,蛋白质摄入量,脂肪摄入量,总能量,总摄入量
  2.数据详情: 
        今日早餐: 碳水摄入量,蛋白质摄入量,脂肪摄入量,总能量
        今日午餐: 碳水摄入量,蛋白质摄入量,脂肪摄入量,总能量
        今日晚餐: 碳水摄入量,蛋白质摄入量,脂肪摄入量,总能量
        昨日早餐: 碳水摄入量,蛋白质摄入量,脂肪摄入量,总能量
        昨日午餐: 碳水摄入量,蛋白质摄入量,脂肪摄入量,总能量
        昨日晚餐: 碳水摄入量,蛋白质摄入量,脂肪摄入量,总能量
  每次返回两天的数据 在mock中模拟
*/