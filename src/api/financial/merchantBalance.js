import request from '@/utils/request'

// 查询商户余额列表
export function listMerchantBalance(query) {
  return request({
    url: '/financial/merchantBalance/list',
    method: 'get',
    params: query
  })
}

// 查询商户余额详细
export function getMerchantBalance(id) {
  return request({
    url: '/financial/merchantBalance/' + id,
    method: 'get'
  })
}

// 新增商户余额
export function addMerchantBalance(data) {
  return request({
    url: '/financial/merchantBalance',
    method: 'post',
    data: data
  })
}
