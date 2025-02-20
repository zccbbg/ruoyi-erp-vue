import request from '@/utils/request'

// 查询商家余额列表
export function listMerchantBalance(query) {
  return request({
    url: '/financial/merchantBalance/list',
    method: 'get',
    params: query
  })
}

// 查询商家余额详细
export function getMerchantBalance(id) {
  return request({
    url: '/financial/merchantBalance/' + id,
    method: 'get'
  })
}

// 新增商家余额
export function addMerchantBalance(data) {
  return request({
    url: '/financial/merchantBalance',
    method: 'post',
    data: data
  })
}

// 修改商家余额
export function updateMerchantBalance(data) {
  return request({
    url: '/financial/merchantBalance',
    method: 'put',
    data: data
  })
}

// 删除商家余额
export function delMerchantBalance(id) {
  return request({
    url: '/financial/merchantBalance/' + id,
    method: 'delete'
  })
}
