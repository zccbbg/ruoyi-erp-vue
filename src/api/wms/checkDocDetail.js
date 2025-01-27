import request from '@/utils/request'

// 查询库存盘点单据详情列表
export function listCheckDocDetail(query) {
  return request({
    url: '/wms/checkDetail/list',
    method: 'get',
    params: query
  })
}

// 查询库存盘点单据详情详细
export function getCheckDocDetail(id) {
  return request({
    url: '/wms/checkDetail/' + id,
    method: 'get'
  })
}

// 新增库存盘点单据详情
export function addCheckDocDetail(data) {
  return request({
    url: '/wms/checkDetail',
    method: 'post',
    data: data
  })
}

// 修改库存盘点单据详情
export function updateCheckDocDetail(data) {
  return request({
    url: '/wms/checkDetail',
    method: 'put',
    data: data
  })
}

// 删除库存盘点单据详情
export function delCheckDocDetail(id) {
  return request({
    url: '/wms/checkDetail/' + id,
    method: 'delete'
  })
}

// 根据盘库单id查询盘库单详情列表
export function listByCheckDocId(checkDocId) {
  return request({
    url: '/wms/checkDetail/list/' + checkDocId,
    method: 'get'
  })
}
