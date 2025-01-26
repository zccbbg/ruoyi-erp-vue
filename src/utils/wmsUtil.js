export function getWarehouseAndSkuKey (row) {
  return row.warehouseId + '_' + row.skuId
}

export function getSourceWarehouseAndSkuKey (row) {
  return row.warehouseId + '_' + row.skuId
}
