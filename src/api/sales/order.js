import request from '@/utils/request'

// 查询销售订单列表
export function listOrder(query) {
  return request({
    url: '/sales/order/list',
    method: 'get',
    params: query
  })
}

// 查询销售订单详细
export function getOrder(id) {
  return request({
    url: '/sales/order/' + id,
    method: 'get'
  })
}

// 新增销售订单
export function addOrder(data) {
  return request({
    url: '/sales/order',
    method: 'post',
    data: data
  })
}

export function passOrder(data) {
  return request({
    url: '/sales/order/pass',
    method: 'post',
    data: data
  })
}

// 修改销售订单
export function updateOrder(data) {
  return request({
    url: '/sales/order',
    method: 'put',
    data: data
  })
}

// 删除销售订单
export function delOrder(id) {
  return request({
    url: '/sales/order/' + id,
    method: 'delete'
  })
}
export function finishSalesStock(id) {
  return request({
    url: '/sales/order/finishStock',
    method: 'post',
    params: { id }
  })
}
