import request from '@/utils/request'

// 查询采购入库单列表
export function listTrade(query) {
  return request({
    url: '/purchase/trade/list',
    method: 'get',
    params: query
  })
}

// 查询采购入库单详细
export function getTrade(id) {
  return request({
    url: '/purchase/trade/' + id,
    method: 'get'
  })
}

// 新增采购入库单
export function addTrade(data) {
  return request({
    url: '/purchase/trade',
    method: 'post',
    data: data
  })
}

// 修改采购入库单
export function updateTrade(data) {
  return request({
    url: '/purchase/trade',
    method: 'put',
    data: data
  })
}

// 删除采购入库单
export function delTrade(id) {
  return request({
    url: '/purchase/trade/' + id,
    method: 'delete'
  })
}
