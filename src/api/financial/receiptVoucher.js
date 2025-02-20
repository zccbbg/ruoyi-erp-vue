import request from '@/utils/request'

// 查询收款单列表
export function listReceiptVoucher(query) {
  return request({
    url: '/financial/receiptVoucher/list',
    method: 'get',
    params: query
  })
}

// 查询收款单详细
export function getReceiptVoucher(id) {
  return request({
    url: '/financial/receiptVoucher/' + id,
    method: 'get'
  })
}

// 新增收款单
export function addReceiptVoucher(data) {
  return request({
    url: '/financial/receiptVoucher',
    method: 'post',
    data: data
  })
}

// 修改收款单
export function updateReceiptVoucher(data) {
  return request({
    url: '/financial/receiptVoucher',
    method: 'put',
    data: data
  })
}

// 修改收款单
export function finishReceiptVoucher(data) {
  return request({
    url: '/financial/receiptVoucher/finish',
    method: 'post',
    data: data
  })
}

// 删除收款单
export function delReceiptVoucher(id) {
  return request({
    url: '/financial/receiptVoucher/' + id,
    method: 'delete'
  })
}
