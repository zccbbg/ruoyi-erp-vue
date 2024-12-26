import request from '@/utils/request';

/**
 * 查询物料列表
 * @param query
 * @returns {*}
 */

export function listItemPage(query) {
  return request({
    url: '/basic/goods/list',
    method: 'get',
    params: query
  });
};

export function listItem(query) {
  return request({
    url: '/basic/goods/listNoPage',
    method: 'get',
    params: query
  });
};

/**
 * 查询物料列表 以sku为维度
 * @param query
 * @returns {*}
 */

export function listItemGroupBySku(query) {
  return request({
    url: '/basic/goodsSku/selectList',
    method: 'get',
    params: query
  });
};

/**
 * 查询物料详细
 * @param id
 */
export function getItem(id) {
  return request({
    url: '/basic/goods/' + id,
    method: 'get'
  });
};

/**
 * 新增物料
 * @param data
 */
export function addItem(data) {
  return request({
    url: '/basic/goods',
    method: 'post',
    data: data
  });
};

/**
 * 修改物料
 * @param data
 */
export function updateItem(data) {
  return request({
    url: '/basic/goods',
    method: 'put',
    data: data
  });
};

/**
 * 删除物料
 * @param id
 */
export function delItem(id) {
  return request({
    url: '/basic/goods/' + id,
    method: 'delete'
  });
};
