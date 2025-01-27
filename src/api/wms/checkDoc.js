import request from '@/utils/request'

// 查询库存盘点单据列表
export function listCheckDoc(query) {
  return request({
    url: '/wms/check/list',
    method: 'get',
    params: query
  })
}

// 查询库存盘点单据详细
export function getCheckDoc(id) {
  return request({
    url: '/wms/check/' + id,
    method: 'get'
  })
}

// 新增库存盘点单据
export function addCheckDoc(data) {
  return request({
    url: '/wms/check',
    method: 'post',
    data: data
  })
}

// 修改库存盘点单据
export function updateCheckDoc(data) {
  return request({
    url: '/wms/check',
    method: 'put',
    data: data
  })
}

// 删除库存盘点单据
export function delCheckDoc(id) {
  return request({
    url: '/wms/check/' + id,
    method: 'delete'
  })
}

// 盘库结束
export function check(data) {
  return request({
    url: '/wms/check/check',
    method: 'post',
    data: data
  })
}
