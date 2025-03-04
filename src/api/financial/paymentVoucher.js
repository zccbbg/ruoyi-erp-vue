import request from '@/utils/request'
// 查询付款单列表
export function listPaymentVoucher(query) {
  return request({
    url: '/financial/paymentVoucher/list',
    method: 'get',
    params: query
  })
}

// 查询付款单详细
export function getPaymentVoucher(id) {
  return request({
    url: '/financial/paymentVoucher/' + id,
    method: 'get'
  })
}

// 新增付款单
export function addPaymentVoucher(data) {
  return request({
    url: '/financial/paymentVoucher',
    method: 'post',
    data: data
  })
}

// 修改付款单
export function updatePaymentVoucher(data) {
  return request({
    url: '/financial/paymentVoucher',
    method: 'put',
    data: data
  })
}


// 删除付款单
export function delPaymentVoucher(id) {
  return request({
    url: '/financial/paymentVoucher/' + id,
    method: 'delete'
  })
}

// 完成收款
export function finishPaymentVoucher(data) {
  return request({
    url: '/financial/paymentVoucher/finish',
    method: 'post',
    data: data
  })
}
