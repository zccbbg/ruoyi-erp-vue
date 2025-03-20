import request from '@/utils/request'

// 查询采购退货单明细列表
export function listRefundDetail(query) {
  return request({
    url: '/purchase/refundDetail/list',
    method: 'get',
    params: query
  })
}

// 查询采购退货单明细详细
export function getRefundDetail(id) {
  return request({
    url: '/purchase/refundDetail/' + id,
    method: 'get'
  })
}

// 新增采购退货单明细
export function addRefundDetail(data) {
  return request({
    url: '/purchase/refundDetail',
    method: 'post',
    data: data
  })
}

// 修改采购退货单明细
export function updateRefundDetail(data) {
  return request({
    url: '/purchase/refundDetail',
    method: 'put',
    data: data
  })
}

// 删除采购退货单明细
export function delRefundDetail(id) {
  return request({
    url: '/purchase/refundDetail/' + id,
    method: 'delete'
  })
}
export function listByRefundId(refundId) {
  return request({
    url: '/purchase/refundDetail/listByRefundId/'+refundId,
    method: 'get'
  })
}
