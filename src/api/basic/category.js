import request from '@/utils/request';

/**
 * 查询物料类型列表
 * @param query
 * @returns {*}
 */

export function listCategoryPage(query) {
  return request({
    url: '/basic/category/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询物料类型列表
 * @param query
 * @returns {*}
 */

export function listCategory(query) {
  return request({
    url: '/basic/category/listNoPage',
    method: 'get',
    params: query
  });
};

/**
 * 获取物料类型下拉树列表
 * @param query
 * @returns {*}
 */

export function treeSelectCategory(query) {
  return request({
    url: '/basic/category/treeselect',
    method: 'get',
    params: query
  });
};

/**
 * 查询物料类型详细
 * @param id
 */
export function getCategory(id) {
  return request({
    url: '/basic/category/' + id,
    method: 'get'
  });
};

/**
 * 新增物料类型
 * @param data
 */
export function addCategory(data) {
  return request({
    url: '/basic/category',
    method: 'post',
    data: data
  });
};

/**
 * 修改物料类型
 * @param data
 */
export function updateCategory(data) {
  return request({
    url: '/basic/category',
    method: 'put',
    data: data
  });
};

/**
 * 删除物料类型
 * @param id
 */
export function delCategory(id) {
  return request({
    url: '/basic/category/' + id,
    method: 'delete'
  });
};

/**
 * 删除物料类型
 * @param data
 */
export function updateOrderNum(data) {
  return request({
    url: '/basic/category/update/orderNum',
    method: 'post',
    data: data
  });
};
