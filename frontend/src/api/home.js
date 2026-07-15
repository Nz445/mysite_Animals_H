import request from '../common/request.js'

// 首页数据 API
export function getHomeData() {
  return request.get('/api/home')
}

export function getPets() {
  return request.get('/api/pets')
}

export function getHighlights() {
  return request.get('/api/highlights')
}
