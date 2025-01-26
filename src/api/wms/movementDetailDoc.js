import request from '@/utils/request'

// 查询库存移动详情列表
export function listMovementOrderDetail(query) {
  return request({
    url: '/wms/movementDetail/list',
    method: 'get',
    params: query
  })
}

// 查询库存移动详情详细
export function getMovementOrderDetail(id) {
  return request({
    url: '/wms/movementDetail/' + id,
    method: 'get'
  })
}

// 新增库存移动详情
export function addMovementOrderDetail(data) {
  return request({
    url: '/wms/movementDetail',
    method: 'post',
    data: data
  })
}

// 修改库存移动详情
export function updateMovementOrderDetail(data) {
  return request({
    url: '/wms/movementDetail',
    method: 'put',
    data: data
  })
}

// 查询调拨单详情列表
export function listByMovementOrderId(movementId) {
  return request({
    url: '/wms/movementDetail/list/' + movementId,
    method: 'get'
  })
}

// 删除库存移动详情
export function delMovementOrderDetail(id) {
  return request({
    url: '/wms/movementDetail/' + id,
    method: 'delete'
  })
}
