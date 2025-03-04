import request from '@/utils/request'

// 查询采购入库单明细列表
export function listTradeDetail(query) {
  return request({
    url: '/purchase/tradeDetail/list',
    method: 'get',
    params: query
  })
}

// 查询采购入库单明细详细
export function getTradeDetail(id) {
  return request({
    url: '/purchase/tradeDetail/' + id,
    method: 'get'
  })
}

// 新增采购入库单明细
export function addTradeDetail(data) {
  return request({
    url: '/purchase/tradeDetail',
    method: 'post',
    data: data
  })
}

// 修改采购入库单明细
export function updateTradeDetail(data) {
  return request({
    url: '/purchase/tradeDetail',
    method: 'put',
    data: data
  })
}

// 删除采购入库单明细
export function delTradeDetail(id) {
  return request({
    url: '/purchase/tradeDetail/' + id,
    method: 'delete'
  })
}

export function listByTradeId(tradeId) {
  return request({
    url: '/purchase/tradeDetail/listByTradeId/'+tradeId,
    method: 'get'
  })
}
