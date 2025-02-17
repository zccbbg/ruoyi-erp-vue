import request from '@/utils/request'

// 查询银行账户列表
export function listBankAccount(query) {
  return request({
    url: '/basic/bankAccount/list',
    method: 'get',
    params: query
  })
}

export function listBankAccountNoPage(query) {
  return request({
    url: '/basic/bankAccount/listNoPage',
    method: 'get',
    params: query
  })
}

// 查询银行账户详细
export function getBankAccount(id) {
  return request({
    url: '/basic/bankAccount/' + id,
    method: 'get'
  })
}

// 新增银行账户
export function addBankAccount(data) {
  return request({
    url: '/basic/bankAccount',
    method: 'post',
    data: data
  })
}

// 修改银行账户
export function updateBankAccount(data) {
  return request({
    url: '/basic/bankAccount',
    method: 'put',
    data: data
  })
}

// 删除银行账户
export function delBankAccount(id) {
  return request({
    url: '/basic/bankAccount/' + id,
    method: 'delete'
  })
}
