// 首页静态数据暂时先放在后端，后续可无缝替换成数据库查询结果。
export const pets = [
  {
    name: '奶糖',
    breed: '布偶猫',
    age: '2岁',
    emoji: '🐱',
    type: 'cat',
    image: '/png/cat/10001 (1).png',
    tags: [
      { text: '温顺', color: 'blue' },
      { text: '黏人', color: 'pink' },
      { text: '爱撒娇', color: 'pink' },
    ],
    status: { text: '健康良好', color: 'green' },
  },
  {
    name: '团子',
    breed: '柯基',
    age: '1岁半',
    emoji: '🐶',
    type: 'dog',
    image: '/png/dog/10002.png',
    tags: [
      { text: '活泼', color: 'pink' },
      { text: '亲人', color: 'blue' },
      { text: '爱玩耍', color: 'blue' },
    ],
    status: { text: '已免疫', color: 'green' },
  },
  {
    name: '棉花',
    breed: '垂耳兔',
    age: '8个月',
    emoji: '🐰',
    type: 'rabbit',
    image: '/png/cat/10003 (2).png',
    tags: [
      { text: '安静', color: 'blue' },
      { text: '好奇', color: 'orange' },
      { text: '待领养', color: 'orange' },
    ],
    status: { text: '待领养', color: 'orange' },
  },
]

export const highlights = [
  { icon: '♡', title: '性格温柔', desc: '性格温柔，喜欢安静地陪伴你' },
  { icon: '✓', title: '健康状态', desc: '健康检查通过，状态良好，活力满满' },
  { icon: '◔', title: '互动习惯', desc: '喜欢互动，也愿意慢慢熟悉新朋友' },
  { icon: '☘', title: '喜爱食物', desc: '最爱的零食是鸡肉条和小鱼干' },
]
