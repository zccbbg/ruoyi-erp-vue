import request from '@/utils/request'

// 查询销售订单明细列表
export function listOrderDetail(query) {
  return request({
    url: '/sales/orderDetail/list',
    method: 'get',
    params: query
  })
}

export function listByOrderId(salesId) {
  return request({
    url: '/sales/orderDetail/listByOrderId/'+salesId,
    method: 'get'
  })
}

// 查询销售订单明细详细
export function getOrderDetail(id) {
  return request({
    url: '/sales/orderDetail/' + id,
    method: 'get'
  })
}

// 新增销售订单明细
export function addOrderDetail(data) {
  return request({
    url: '/sales/orderDetail',
    method: 'post',
    data: data
  })
}

// 修改销售订单明细
export function updateOrderDetail(data) {
  return request({
    url: '/sales/orderDetail',
    method: 'put',
    data: data
  })
}

// 删除销售订单明细
export function delOrderDetail(id) {
  return request({
    url: '/sales/orderDetail/' + id,
    method: 'delete'
  })
}
