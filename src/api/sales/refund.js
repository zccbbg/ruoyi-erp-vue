import request from '@/utils/request'

// 查询销售退货单列表
export function listRefund(query) {
  return request({
    url: '/sales/refund/list',
    method: 'get',
    params: query
  })
}

// 查询销售退货单详细
export function getRefund(id) {
  return request({
    url: '/sales/refund/' + id,
    method: 'get'
  })
}

// 新增销售退货单
export function addRefund(data) {
  return request({
    url: '/sales/refund',
    method: 'post',
    data: data
  })
}

// 修改销售退货单
export function updateRefund(data) {
  return request({
    url: '/sales/refund',
    method: 'put',
    data: data
  })
}

// 删除销售退货单
export function delRefund(id) {
  return request({
    url: '/sales/refund/' + id,
    method: 'delete'
  })
}
//完成退单
export function passSalesRefund(data) {
  return request({
    url: '/sales/refund/pass',
    method: 'post',
    data: data
  })
}

