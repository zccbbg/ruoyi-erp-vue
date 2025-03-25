import request from '@/utils/request'

// 查询销售退货单明细列表
export function listRefundDetail(query) {
  return request({
    url: '/sales/refundDetail/list',
    method: 'get',
    params: query
  })
}

// 查询销售退货单明细详细
export function getRefundDetail(id) {
  return request({
    url: '/sales/refundDetail/' + id,
    method: 'get'
  })
}

// 新增销售退货单明细
export function addRefundDetail(data) {
  return request({
    url: '/sales/refundDetail',
    method: 'post',
    data: data
  })
}

// 修改销售退货单明细
export function updateRefundDetail(data) {
  return request({
    url: '/sales/refundDetail',
    method: 'put',
    data: data
  })
}

// 删除销售退货单明细
export function delRefundDetail(id) {
  return request({
    url: '/sales/refundDetail/' + id,
    method: 'delete'
  })
}
export function listBySalesRefundId(refundId) {
  return request({
    url: '/sales/refundDetail/listByRefundId/'+refundId,
    method: 'get'
  })
}
