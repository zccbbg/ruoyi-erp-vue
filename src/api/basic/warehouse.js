import request from '@/utils/request'

/**
 * 查询仓库列表
 * @param query
 * @returns {*}
 */

export function listWarehouse(query) {
  return request({
    url: '/basic/warehouse/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询仓库列表
 * @param query
 * @returns {*}
 */

export function listWarehouseNoPage(query) {
  return request({
    url: '/basic/warehouse/listNoPage',
    method: 'get',
    params: query
  });
};

/**
 * 查询仓库详细
 * @param id
 */
export function getWarehouse(id) {
  return request({
    url: '/basic/warehouse/' + id,
    method: 'get'
  });
};

/**
 * 新增仓库
 * @param data
 */
export function addWarehouse(data) {
  return request({
    url: '/basic/warehouse',
    method: 'post',
    data: data
  });
};

/**
 * 修改仓库
 * @param data
 */
export function updateWarehouse(data) {
  return request({
    url: '/basic/warehouse',
    method: 'put',
    data: data
  });
};

/**
 * 删除仓库
 * @param id
 */
export function delWarehouse(id) {
  return request({
    url: '/basic/warehouse/' + id,
    method: 'delete'
  });
};

export function updateOrderNum (data) {
  return request({
    url: '/basic/warehouse/update/orderNum',
    method: 'post',
    data: data
  });
};


