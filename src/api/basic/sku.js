import request from '@/utils/request';

/**
 * 查询sku信息列表
 * @param query
 * @returns {*}
 */

export function listSkuPage(query) {
  return request({
    url: '/basic/sku/list',
    method: 'get',
    params: query
  });
};
export function listSkuByPost(query) {
  return request({
    url: '/basic/sku/list',
    method: 'post',
    data: query
  });
};
export function listSku(query) {
  return request({
    url: '/basic/sku/listNoPage',
    method: 'get',
    params: query
  });
};

/**
 * 查询sku信息详细
 * @param id
 */
export function getSku(id) {
  return request({
    url: '/basic/sku/' + id,
    method: 'get'
  });
};

/**
 * 新增sku信息
 * @param data
 */
export function addSku(data) {
  return request({
    url: '/basic/sku',
    method: 'post',
    data: data
  });
};

/**
 * 修改sku信息
 * @param data
 */
export function updateSku(data) {
  return request({
    url: '/basic/sku',
    method: 'put',
    data: data
  });
};

/**
 * 删除sku信息
 * @param id
 */
export function delSku(id) {
  return request({
    url: '/basic/sku/' + id,
    method: 'delete'
  });
};
