import request from '@/utils/request'

// 查询交易流水列表
export function listTransHistory(query) {
  return request({
    url: '/financial/transHistory/list',
    method: 'get',
    params: query
  })
}

// 查询交易流水详细
export function getTransHistory(id) {
  return request({
    url: '/financial/transHistory/' + id,
    method: 'get'
  })
}
