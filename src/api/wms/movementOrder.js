import request from '@/utils/request'

// 查询调拨单列表
export function listMovementOrder(query) {
  return request({
    url: '/wms/movement/list',
    method: 'get',
    params: query
  })
}

// 查询调拨单详细
export function getMovementOrder(id) {
  return request({
    url: '/wms/movement/' + id,
    method: 'get'
  })
}

// 新增调拨单
export function addMovementOrder(data) {
  return request({
    url: '/wms/movement',
    method: 'post',
    data: data
  })
}

// 修改调拨单
export function updateMovementOrder(data) {
  return request({
    url: '/wms/movement',
    method: 'put',
    data: data
  })
}

// 删除调拨单
export function delMovementOrder(id) {
  return request({
    url: '/wms/movement/' + id,
    method: 'delete'
  })
}

// 调拨
export function movement(data) {
  return request({
    url: '/wms/movement/move',
    method: 'post',
    data: data
  })
}
