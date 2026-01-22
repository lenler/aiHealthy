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

// --- 用户认证接口 ---

/**
 * 1. 登录接口
 * @usage
 * axios.post('https://localhost:8080/login', {
 *   username: '13800138000',
 *   password: 'Test@123'
 * }).then(res => console.log(res.data));
 */
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

// --- 首页数据接口 (Dashboard) ---

/**
 * 1. 获取首页综合数据 (Dashboard Summary)
 * @usage
 * axios.get('https://localhost:8080/dashboard')
 *   .then(res => console.log(res.data));
 */
Mock.mock('https://localhost:8080/dashboard', 'get', () => {
  const today = new Date().toISOString().split('T')[0]
  // 计算昨天日期
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = yesterdayDate.toISOString().split('T')[0]

  return {
    code: 200,
    message: 'success',
    data: {
      // 仪表盘汇总
      summary: {
        carbs: { current: 50, target: 120, unit: 'g' },
        protein: { current: 70, target: 100, unit: 'g' },
        fat: { current: 25, target: 40, unit: 'g' },
        calories: { current: 900, target: 2000, unit: 'kcal' },
        totalIntake: 1200
      },
      // 今日记录
      todayRecord: {
        date: today,
        meals: {
          breakfast: { name: '燕麦拿铁, 全麦面包', calories: 320 ,img:'https://picsum.photos/200/301'},
          lunch: { name: '鸡胸肉沙拉', calories: 450 ,img:'https://picsum.photos/200/302'},
          dinner: { name: '', calories: 0,img:'https://picsum.photos/200/303' }
        }
      },
      // 昨日记录
      yesterdayRecord: {
        date: yesterday,
        meals: {
          breakfast: { name: '牛奶, 鸡蛋', calories: 280 ,img:'https://picsum.photos/200/304'},
          lunch: { name: '牛肉盖饭', calories: 600 ,img:'https://picsum.photos/200/305'},
          dinner: { name: '水果沙拉', calories: 150 ,img:'https://picsum.photos/200/306'}
        }
      }
    }
  }
})

/**
 * 2. 新增今日个人详情数据 (Create Record)
 * @usage
 * axios.post('https://localhost:8080/records', {
 *   type: 'breakfast', 
 *   name: '燕麦拿铁, 全麦面包',
 *   calories: 320
 * }).then(res => console.log(res.data));
 */
Mock.mock('https://localhost:8080/records', 'post', (options: any) => {
  const body = JSON.parse(options.body)
  console.log('body',body);

  return {
    code: 201, // Created
    message: '新增成功',
    data: '新增成功'
  }
})

/**
 * 3. 更新今日指定餐次数据 (Update Record)
 * @usage
 * axios.put('https://localhost:8080/records/breakfast', {
 *   name: '燕麦拿铁, 全麦面包',
 *   calories: 320
 * }).then(res => console.log(res.data));
 */
Mock.mock(RegExp('https://localhost:8080/records/(breakfast|lunch|dinner)'), 'put', (options: any) => {
  const body = JSON.parse(options.body)
  if(body.name===''||body.calories===0){
    return {
      code: 200,
      message: '删除成功',
      data: '删除成功'
    }
  }else{
    return {
    code: 200,
    message: `更新成功`,
    data: '更新成功'
  }
  }  
})

/**
 * 4. 删除今日指定餐次数据 (Delete Record)
 * @usage
 * axios.delete('https://localhost:8080/records/breakfast')
 *   .then(res => console.log(res.data));
 */
Mock.mock(RegExp('https://localhost:8080/records/(breakfast|lunch|dinner)'), 'delete', (options: any) => {
  const url = options.url
  const type = url.split('/').pop()

  return {
    code: 200,
    message: `成功删除今日 ${type} 数据`,
    data: null
  }
})