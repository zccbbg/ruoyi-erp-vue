import request from '@/utils/request'

// 查询入库单列表
export function listReceiptOrder(query) {
  return request({
    url: '/wms/receipt/list',
    method: 'get',
    params: query
  })
}

// 查询入库单详细
export function getReceiptOrder(id) {
  return request({
    url: '/wms/receipt/' + id,
    method: 'get'
  })
}

// 新增入库单
export function addReceiptOrder(data) {
  return request({
    url: '/wms/receipt',
    method: 'post',
    data: data
  })
}

// 修改入库单
export function updateReceiptOrder(data) {
  return request({
    url: '/wms/receipt',
    method: 'put',
    data: data
  })
}

// 删除入库单
export function delReceiptOrder(id) {
  return request({
    url: '/wms/receipt/' + id,
    method: 'delete'
  })
}

// 执行入库
export function warehousing(data) {
  return request({
    url: '/wms/receipt/warehousing',
    method: 'post',
    data: data
  })
}

// 生成入库单号
export function generateReceiptOrderNo() {
  return request({
    url: '/wms/receipt/generate/no',
    method: 'get'
  })
}
