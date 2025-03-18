import request from '@/utils/request'

// 查询销售出库单明细列表
export function listTradeDetail(query) {
  return request({
    url: '/sales/tradeDetail/list',
    method: 'get',
    params: query
  })
}

// 查询销售出库单明细详细
export function getTradeDetail(id) {
  return request({
    url: '/sales/tradeDetail/' + id,
    method: 'get'
  })
}

// 新增销售出库单明细
export function addTradeDetail(data) {
  return request({
    url: '/sales/tradeDetail',
    method: 'post',
    data: data
  })
}

// 修改销售出库单明细
export function updateTradeDetail(data) {
  return request({
    url: '/sales/tradeDetail',
    method: 'put',
    data: data
  })
}

// 删除销售出库单明细
export function delTradeDetail(id) {
  return request({
    url: '/sales/tradeDetail/' + id,
    method: 'delete'
  })
}

export function listByTradeId(tradeId) {
  return request({
    url: '/sales/tradeDetail/listByTradeId/'+tradeId,
    method: 'get'
  })
}
