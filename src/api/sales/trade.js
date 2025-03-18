import request from '@/utils/request'

// 查询销售出库单列表
export function listTrade(query) {
  return request({
    url: '/sales/trade/list',
    method: 'get',
    params: query
  })
}

// 查询销售出库单详细
export function getTrade(id) {
  return request({
    url: '/sales/trade/' + id,
    method: 'get'
  })
}

// 新增销售出库单
export function addTrade(data) {
  return request({
    url: '/sales/trade',
    method: 'post',
    data: data
  })
}

// 修改销售出库单
export function updateTrade(data) {
  return request({
    url: '/sales/trade',
    method: 'put',
    data: data
  })
}

// 删除销售出库单
export function delTrade(id) {
  return request({
    url: '/sales/trade/' + id,
    method: 'delete'
  })
}

export function passTrade(data) {
  return request({
    url: '/sales/trade/pass',
    method: 'post',
    data: data
  })
}
