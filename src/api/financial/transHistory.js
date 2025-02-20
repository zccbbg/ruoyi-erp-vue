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

// 新增交易流水
export function addTransHistory(data) {
  return request({
    url: '/financial/transHistory',
    method: 'post',
    data: data
  })
}

// 修改交易流水
export function updateTransHistory(data) {
  return request({
    url: '/financial/transHistory',
    method: 'put',
    data: data
  })
}

// 删除交易流水
export function delTransHistory(id) {
  return request({
    url: '/financial/transHistory/' + id,
    method: 'delete'
  })
}
