export function getWarehouseAndSkuKey (row) {
  return row.warehouseId + '_' + row.skuId
}

export function getSourceWarehouseAndSkuKey (row) {
  return row.warehouseId + '_' + row.skuId
}

export function  getSummaries (param) {
  const { columns, data } = param;
  const sums = [];

  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计';
      return;
    }

    const values = data.map(item => {
      const value = Number(item[column.property]);
      return isNaN(value) ? 0 : value;
    });

    if (values.some(value => value !== 0)) {
      const total = values.reduce((prev, curr) => prev + curr, 0);
      sums[index] = ` ${total.toFixed(2)}`; // 根据实际货币符号调整
    } else {
      sums[index] = '';
    }
  });

  return sums;
}


/** 计算总金额*/
export function getTotalAmount(goodsAmount, otherExpensesAmount) {
  const validGoodsAmount = isNaN(parseFloat(goodsAmount))? 0 : parseFloat(goodsAmount);
  const validOtherExpensesAmount = isNaN(parseFloat(otherExpensesAmount))? 0 : parseFloat(otherExpensesAmount);
  const total = validGoodsAmount + validOtherExpensesAmount;
  return total.toFixed(2);
}
