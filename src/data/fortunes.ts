export interface Fortune {
  /** 签名，如「大吉 · 鸡到成功」 */
  title: string
  /** 签文解语 */
  text: string
}

/** 今日坤签的全部签文，原型来自 ikun之家单页版「今日坤签」 */
export const FORTUNES: Fortune[] = [
  { title: '大吉 · 鸡到成功', text: '今日宜：大胆出手。投篮必进，表白必成，代码一次跑通。' },
  { title: '中吉 · 稳中带皮', text: '今日宜：低调练习。把基本功再磨两年半，好运在路上。' },
  { title: '上签 · 只因你太美', text: '今日宜：出门走走。你今天的美貌和运气，都不太讲道理。' },
  { title: '吉 · 篮球入网', text: '今日宜：运动。去投几个篮，烦恼会自己弹出去。' },
  { title: '小吉 · 唱跳俱佳', text: '今日宜：开口唱。五音不全也没关系，气势到位就是满分。' },
  { title: '平签 · 贵在坚持', text: '今日宜：躺平一会儿。练了两年半了，歇一天不算偷懒。' },
  { title: '大吉 · 全场焦点', text: '今日宜：站上 C 位。今天所有人的目光，都会只因你太美。' },
  { title: '中平 · 先练基本功', text: '今日宜：复盘。把昨天打铁的那一球，在心里重投一百遍。' },
]

/** 随机抽一支签；random 可注入以便测试 */
export function pickFortune(random: () => number = Math.random): Fortune {
  const index = Math.min(FORTUNES.length - 1, Math.max(0, Math.floor(random() * FORTUNES.length)))
  return FORTUNES[index]
}
