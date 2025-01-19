import request from '@/utils/request'

// 查询入库单详情列表
export function listReceiptDocDetail(query) {
  return request({
    url: '/wms/receiptDetail/list',
    method: 'get',
    params: query
  })
}

// 查询入库单详情详细
export function getReceiptDocDetail(id) {
  return request({
    url: '/wms/receiptDetail/' + id,
    method: 'get'
  })
}

// 新增入库单详情
export function addReceiptDocDetail(data) {
  return request({
    url: '/wms/receiptDetail',
    method: 'post',
    data: data
  })
}

// 修改入库单详情
export function updateReceiptDocDetail(data) {
  return request({
    url: '/wms/receiptDetail',
    method: 'put',
    data: data
  })
}

// 删除入库单详情
export function delReceiptDocDetail(id) {
  return request({
    url: '/wms/receiptDetail/' + id,
    method: 'delete'
  })
}

// 查询入库单详情列表
export function listByReceiptDocId(receiptDocId) {
  return request({
    url: '/wms/receiptDetail/list/' + receiptDocId,
    method: 'get'
  })
}
