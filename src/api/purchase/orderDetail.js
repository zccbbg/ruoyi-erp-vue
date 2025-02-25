import request from '@/utils/request'

// 查询采购订单明细列表
export function listOrderDetail(query) {
  return request({
    url: '/purchase/orderDetail/list',
    method: 'get',
    params: query
  })
}

export function listByOrderId(orderId) {
  return request({
    url: '/purchase/orderDetail/listByOrderId/'+orderId,
    method: 'get'
  })
}

// 查询采购订单明细详细
export function getOrderDetail(id) {
  return request({
    url: '/purchase/orderDetail/' + id,
    method: 'get'
  })
}

// 新增采购订单明细
export function addOrderDetail(data) {
  return request({
    url: '/purchase/orderDetail',
    method: 'post',
    data: data
  })
}

// 修改采购订单明细
export function updateOrderDetail(data) {
  return request({
    url: '/purchase/orderDetail',
    method: 'put',
    data: data
  })
}

// 删除采购订单明细
export function delOrderDetail(id) {
  return request({
    url: '/purchase/orderDetail/' + id,
    method: 'delete'
  })
}
