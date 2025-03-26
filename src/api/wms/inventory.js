import request from '@/utils/request'

// 查询库存列表
export function listInventoryByTradeId(query) {
  return request({
    url: '/wms/inventory/boardList/warehouse/tradeId',
    method: 'get',
    params: query
  })
}
export function listInventoryByOrderId(query) {
  return request({
    url: '/wms/inventory/boardList/warehouse/orderId',
    method: 'get',
    params: query
  })
}
export function listInventoryNoPage(query) {
  return request({
    url: '/wms/inventory/listNoPage',
    method: 'get',
    params: query
  })
}

// 查询库存看板仓库维度列表
export function listInventoryBoard(query,type) {
  return request({
    url: '/wms/inventory/boardList/'+type,
    method: 'get',
    params: query
  })
}

// 查询库存详细
export function getInventory(id) {
  return request({
    url: '/wms/inventory/' + id,
    method: 'get'
  })
}

// 新增库存
export function addInventory(data) {
  return request({
    url: '/wms/inventory',
    method: 'post',
    data: data
  })
}

// 修改库存
export function updateInventory(data) {
  return request({
    url: '/wms/inventory',
    method: 'put',
    data: data
  })
}

// 删除库存
export function delInventory(id) {
  return request({
    url: '/wms/inventory/' + id,
    method: 'delete'
  })
}
