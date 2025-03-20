import request from '@/utils/request'

// 查询采购退货单列表
export function listRefund(query) {
  return request({
    url: '/purchase/refund/list',
    method: 'get',
    params: query
  })
}

// 查询采购退货单详细
export function getRefund(id) {
  return request({
    url: '/purchase/refund/' + id,
    method: 'get'
  })
}

// 新增采购退货单
export function addRefund(data) {
  return request({
    url: '/purchase/refund',
    method: 'post',
    data: data
  })
}

// 修改采购退货单
export function updateRefund(data) {
  return request({
    url: '/purchase/refund',
    method: 'put',
    data: data
  })
}

// 删除采购退货单
export function delRefund(id) {
  return request({
    url: '/purchase/refund/' + id,
    method: 'delete'
  })
}
//完成采购退货单
export function passRefund(data) {
  return request({
    url: '/purchase/refund/pass',
    method: 'post',
    data: data
  })
}
