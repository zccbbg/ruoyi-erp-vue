import request from '@/utils/request'

// 查询商品品牌列表
export function listBrandPage(query) {
  return request({
    url: '/basic/brand/list',
    method: 'get',
    params: query
  })
}

// 查询商品品牌列表
export function listBrand(query) {
  return request({
    url: '/basic/brand/listNoPage',
    method: 'get',
    params: query
  })
}

// 查询商品品牌详细
export function getBrand(id) {
  return request({
    url: '/basic/brand/' + id,
    method: 'get'
  })
}

// 新增商品品牌
export function addBrand(data) {
  return request({
    url: '/basic/brand',
    method: 'post',
    data: data
  })
}

// 修改商品品牌
export function updateBrand(data) {
  return request({
    url: '/basic/brand',
    method: 'put',
    data: data
  })
}

// 删除商品品牌
export function delBrand(id) {
  return request({
    url: '/basic/brand/' + id,
    method: 'delete'
  })
}
