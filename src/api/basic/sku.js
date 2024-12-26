import request from '@/utils/request';

/**
 * 查询sku信息列表
 * @param query
 * @returns {*}
 */

export function listItemSkuPage(query) {
  return request({
    url: '/basic/sku/list',
    method: 'get',
    params: query
  });
};

export function listItemSku(query) {
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
export function getItemSku(id) {
  return request({
    url: '/basic/sku/' + id,
    method: 'get'
  });
};

/**
 * 新增sku信息
 * @param data
 */
export function addItemSku(data) {
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
export function updateItemSku(data) {
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
export function delItemSku(id) {
  return request({
    url: '/basic/sku/' + id,
    method: 'delete'
  });
};
