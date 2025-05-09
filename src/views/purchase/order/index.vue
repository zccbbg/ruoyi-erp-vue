<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
              <el-form-item label="单据编号" prop="docNo">
                <el-input
                  v-model="queryParams.docNo"
                  placeholder="请输入单据编号"
                  clearable
                  @keyup.enter="handleQuery"
                />
              </el-form-item>
              <el-form-item label="单据日期" style="width: 308px">
                <el-date-picker
                  v-model="daterangeBillDate"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  type="daterange"
                  range-separator="-"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="交货日期" style="width: 308px">
                <el-date-picker
                  v-model="daterangeDeliveryDate"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  type="daterange"
                  range-separator="-"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="编辑状态" prop="checkedStatus">
                <el-select v-model="queryParams.checkedStatus" placeholder="请选择编辑状态" clearable>
                  <el-option
                    v-for="dict in finish_status"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt20">

      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="6"><span style="font-size: large">采购订单</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['purchase:order:all']"
          >新增</el-button>
<!--          <el-button-->
<!--            type="warning"-->
<!--            plain-->
<!--            icon="Download"-->
<!--            @click="handleExport"-->
<!--            v-hasPermi="['purchase:order:all']"-->
<!--          >导出</el-button>-->
        </el-col>
      </el-row>

      <el-table v-loading="loading"
                :data="orderList" border class="mt20"
                @expand-change="handleExpandExchange"
                :row-key="getRowKey"
                :expand-row-keys="expandedRowKeys">
          <el-table-column type="expand">
            <template #default="props">
              <div style="padding: 0 50px 20px 50px" v-loading="detailLoading[props.$index]">
                <el-descriptions>
                  <el-descriptions-item label="商品金额:">{{props.row.goodsAmount}}</el-descriptions-item>
                  <el-descriptions-item label="其他费用:">{{props.row.otherExpensesAmount}}</el-descriptions-item>
                  <el-descriptions-item label="本次预付:">{{props.row.prepayAmount}}</el-descriptions-item>
                  <el-descriptions-item label="剩余金额:">{{props.row.actualAmount - props.row.prepayAmount}}</el-descriptions-item>
                </el-descriptions>
                <h3>商品明细</h3>
                <el-table :data="props.row.details"  empty-text="暂无商品明细" show-summary  :summary-method="getSummaries">
                  <el-table-column label="商品名称">
                    <template #default="{ row }">
                      <div>{{ row?.goods?.goodsName }}</div>
                    </template>
                  </el-table-column>
                  <el-table-column label="规格名称">
                    <template #default="{ row }">
                      <div>{{ row?.sku?.skuName }}</div>
                    </template>
                  </el-table-column>
                  <el-table-column label="仓库" align="left">
                    <template #default="{ row }">
                      <div>{{ useBasicStore().warehouseMap.get(row.warehouseId)?.warehouseName }}</div>
                    </template>
                  </el-table-column>
                  <el-table-column label="单价(元)" align="right" prop="priceWithTax">
                    <template #default="{ row }">
                      <el-statistic v-if="row.priceWithTax || row.priceWithTax === 0" :precision="2" :value="Number(row.priceWithTax)"/>
                      <div v-else>-</div>
                    </template>
                  </el-table-column>
                  <el-table-column label="数量" prop="qty" align="right">
                    <template #default="{ row }">
                      <el-statistic :value="Number(row.qty)" :precision="0"/>
                    </template>
                  </el-table-column>
                  <el-table-column label="金额(元)" align="right" prop="totalAmount">
                    <template #default="{ row }">
                      <el-statistic v-if="row.totalAmount || row.totalAmount === 0" :precision="2" :value="Number(row.totalAmount)"/>
                      <div v-else>-</div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </template>
          </el-table-column>
            <el-table-column label="" prop="id" v-if="false"/>
            <el-table-column label="单据编号" prop="docNo" min-width="120"/>
            <el-table-column label="单据日期/交货日期" prop="docDate" width="160">
              <template #default="scope">
                <div v-if="scope.row.docDate">单据：{{ parseTime(scope.row.docDate, '{y}-{m}-{d}') }}</div>
                <div v-if="scope.row.deliveryDate">交货：{{ parseTime(scope.row.deliveryDate, '{y}-{m}-{d}') }}</div>
              </template>
            </el-table-column>
            <el-table-column label="供应商" prop="merchantId" min-width="120">
              <template #default="{ row }">
                <div>{{ useBasicStore().merchantMap.get(row.merchantId)?.merchantName }}</div>
              </template>
            </el-table-column>
            <el-table-column label="编辑状态" prop="checkedStatus" align="center">
              <template #default="scope">
                  <dict-tag :options="finish_status" :value="scope.row.checkedStatus"/>
              </template>
            </el-table-column>
            <el-table-column label="入库状态" prop="stockStatus" align="center">
              <template #default="scope">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <dict-tag :options="wms_receipt_status" :value="scope.row.stockStatus"/>
                  <el-button :icon="Finished" @click="handleFinishStock(scope.row)" link v-if="scope.row.stockStatus != 2 && scope.row.checkedStatus!=0"></el-button>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="采购入库单编号" prop="tradeNoList" align="center">
              <template #default="scope">
                <div v-for="(item, index) in scope.row.tradeNoList" :key="index">
                  {{ item }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="总金额"  align="right">
              <template #default="scope">
                {{ getTotalAmount(scope.row.goodsAmount, scope.row.otherExpensesAmount) }}
              </template>
            </el-table-column>
            <el-table-column label="优惠金额" prop="discountAmount" align="right"/>
            <el-table-column label="实际金额" prop="actualAmount" align="right"/>
        <el-table-column label="操作" align="right" class-name="small-padding fixed-width" width="120">
          <template #default="scope">
            <div>
              <el-popover
                placement="left"
                title="提示"
                :width="300"
                trigger="hover"
                :disabled="scope.row.checkedStatus === 0"
                :content="'订单【' + scope.row.docNo + '】已完成，无法修改！' "
              >
                <template #reference>
                  <el-button link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['purchase:order:all']" :disabled="[1].includes(scope.row.checkedStatus)">修改</el-button>
                </template>
              </el-popover>
              <el-button link type="primary" @click="handleGoDetail(scope.row)" v-hasPermi="['purchase:order:all']">{{ expandedRowKeys.includes(scope.row.id) ? '收起' : '查看' }}</el-button>
            </div>
            <div>
              <el-popover
                placement="left"
                title="提示"
                :width="300"
                trigger="hover"
                :disabled="scope.row.checkedStatus === 0"
                :content="'订单【' + scope.row.docNo + '】已完成，无法删除！' "
              >
                <template #reference>
                  <el-button type="danger" @click="handleDelete(scope.row)" link v-hasPermi="['purchase:order:all']" :disabled="[1].includes(scope.row.checkedStatus)">删除</el-button>
                </template>
              </el-popover>
              <el-popover
                placement="left"
                title="提示"
                :width="300"
                trigger="hover"
                :disabled="scope.row.checkedStatus === 1"
                :content="'订单【' + scope.row.docNo + '】未完成，无法入库！' "
              >
                <template #reference>
                  <el-button type="primary" @click="handleTrade(scope.row)" link v-hasPermi="['wms:check:all']" :disabled="[0].includes(scope.row.checkedStatus)">入库</el-button>
                </template>
              </el-popover>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-row>
        <pagination
          v-show="total>0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </el-row>

    </el-card>
  </div>
</template>

<script setup name="Order">
import {
  listOrder,
  delOrder,
  addOrder,
  updateOrder,
  finishPurchaseStock
} from "@/api/purchase/order";
  import {useBasicStore} from "@/store/modules/basic";
  import {listByOrderId} from "@/api/purchase/orderDetail";
  import {useRoute} from "vue-router";
  import {getCurrentInstance, onMounted, reactive, ref, toRefs} from "vue";
  import {parseTime} from "@/utils/ruoyi";
  import {getSummaries, getTotalAmount} from "@/utils/wmsUtil";
import {Edit, Finished} from "@element-plus/icons-vue";
const { proxy } = getCurrentInstance();
    const { finish_status } = proxy.useDict('finish_status');
    const { wms_receipt_status } = proxy.useDict('wms_receipt_status');
  // 当前展开集合
  const expandedRowKeys = ref([])
  let orderList = reactive([]);
  const open = ref(false);
  const buttonLoading = ref(false);
  const loading = ref(true);
  const ids = ref([]);
  const total = ref(0);
  const title = ref("");
    const daterangeBillDate = ref([]);
    const daterangeDeliveryDate = ref([]);
  // 商品明细table的loading状态集合
  const detailLoading = ref([])
  const data = reactive({
    form: {},
    queryParams: {
      pageNum: 1,
      pageSize: 10,
      docNo: undefined,
      docDate: undefined,
      deliveryDate: undefined,
      checkedStatus: undefined,
      stockStatus: undefined,
    },
  rules: {
    docNo: [
      { required: true, message: "单据编号不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询采购订单列表 */
function getList() {
  loading.value = true;
    queryParams.value.params = {};
  if (null != daterangeBillDate && '' != daterangeBillDate) {
    queryParams.value.params["beginBillDate"] = daterangeBillDate.value[0];
    queryParams.value.params["endBillDate"] = daterangeBillDate.value[1];
  }
  if (null != daterangeDeliveryDate && '' != daterangeDeliveryDate) {
    queryParams.value.params["beginDeliveryDate"] = daterangeDeliveryDate.value[0];
    queryParams.value.params["endDeliveryDate"] = daterangeDeliveryDate.value[1];
  }
  listOrder(queryParams.value).then(response => {
    expandedRowKeys.value = []
    orderList = response.rows.map(order => ({
      ...order,
      details: [] // 提前声明
    }))
    total.value = response.total;
    loading.value = false;
  });
}

  async function handleTrade(row) {
    proxy.$router.push({ path: "/purchase/tradeEdit",  query: {orderNo: row.docNo ,orderId: row.id ,merchantId: row.merchantId} });
  }

  function handleExpandExchange(value, expandedRows) {
    if (!ifExpand(expandedRows)) {
      return
    }
    expandedRowKeys.value = expandedRows.map(it => it.id)
    loadOrderDetail(value)
  }

  function loadOrderDetail(row) {
    const index = orderList.findIndex(it => it.id === row.id)
    detailLoading.value[index] = true
    listByOrderId(row.id).then(res => {
        const details = res.data.map(it => {
          return {
            ...it,
            warehouseName: useBasicStore().warehouseMap.get(it.warehouseId)?.warehouseName,
          }
        })
      orderList[index].details = details
    }).finally(() => {
      detailLoading.value[index] = false
    })
  }

  function getRowKey(row) {
    return row.id
  }

  function ifExpand(expandedRows) {
    if (expandedRows.length < expandedRowKeys.value.length) {
      expandedRowKeys.value = expandedRows.map(it => it.id)
      return false;
    }
    return true
  }

 function handleGoDetail(row) {
    const index = expandedRowKeys.value.indexOf(row.id)
    if (index !== -1) {
      // 收起
      expandedRowKeys.value.splice(index, 1)
    } else {
      // 展开
      expandedRowKeys.value.push(row.id)
       loadOrderDetail(row)
    }
  }

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    docNo: null,
    docDate: null,
    deliveryDate: null,
    checkedStatus: null,
    checkedBy: null,
    stockStatus: [],
    merchantId: null,
    goodsQty: null,
    processedQty: null,
    goodsAmount: null,
    otherExpensesAmount: null,
    discountAmount: null,
    actualAmount: null,
    prepayAmount: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("orderRef");
}
/** 修改入库状态为入库完成*/
function handleFinishStock(row){
  proxy.$modal.confirm('将 "' + row.docNo + '" 标记为入库完成？').then(function() {
    loading.value = true;
    return finishPurchaseStock(row.id);
  }).then(() => {
    loading.value = true;
    getList();
    proxy.$modal.msgSuccess("标记成功");
  }).catch(() => {
  }).finally(() => {
    loading.value = false;
  });
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

    /** 重置按钮操作 */
    function resetQuery() {
      daterangeBillDate.value = [];
      daterangeDeliveryDate.value = [];
    proxy.resetForm("queryRef");
    handleQuery();
  }

  /** 新增按钮操作 */
  function handleAdd() {
    proxy.$router.push({ path: "/purchase/orderEdit" });
}

/** 修改按钮操作 */
function handleUpdate(row) {
  proxy.$router.push({ path: "/purchase/orderEdit",  query: { id: row.id } });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["orderRef"].validate(valid => {
    if (valid) {
      buttonLoading.value = true;
      form.value.stockStatus = form.value.stockStatus.join(",");
      if (form.value.id != null) {
        updateOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        }).finally(() => {
          buttonLoading.value = false;
        });
      } else {
        addOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        }).finally(() => {
          buttonLoading.value = false;
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  const docNo = row.docNo || '';
  proxy.$modal.confirm('是否确认删除采购订单编号为"' + docNo + '"的数据项？').then(function() {
    loading.value = true;
    return delOrder(_ids);
  }).then(() => {
    loading.value = true;
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  }).finally(() => {
    loading.value = false;
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('purchase/order/export', {
    ...queryParams.value
  }, `order_${new Date().getTime()}.xlsx`)
}
  const route = useRoute();
  onMounted(() => {
    const relatedNo = route.query && route.query.relatedNo;
    if (relatedNo) {
      queryParams.value.docNo = relatedNo;
    }
    getList();
  })
</script>
