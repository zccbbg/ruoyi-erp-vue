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
        <el-col :span="6"><span style="font-size: large">销售出库单</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['sales:trade:add']"
          >新增</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading"
                :data="tradeList" border class="mt20"
                @expand-change="handleExpandExchange"
                :row-key="getRowKey"
                :expand-row-keys="expandedRowKeys">
        <el-table-column type="expand">
          <template #default="props">
            <div style="padding: 0 50px 20px 50px">
              <h3>商品明细</h3>
              <el-table :data="props.row.details" v-loading="detailLoading[props.$index]" empty-text="暂无商品明细">
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
                <el-table-column label="单价(元)" align="right">
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
                <el-table-column label="金额(元)" align="right">
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
        <el-table-column label="单据编号" prop="docNo" />
        <el-table-column label="单据日期" align="center" prop="docDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.docDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="供应商" prop="merchantId" min-width="120" >
          <template #default="{ row }">
            <div>{{ useBasicStore().merchantMap.get(row.merchantId)?.merchantName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="编辑状态" prop="checkedStatus">
          <template #default="scope">
            <dict-tag :options="finish_status" :value="scope.row.checkedStatus"/>
          </template>
        </el-table-column>
        <el-table-column label="退货状态/退货金额"  width="160" align="center">
          <template #default="scope">
            <div v-if="scope.row.refundStatus">
              <dict-tag :options="refund_status" :value="scope.row.refundStatus"/>
            </div>
            <div v-if="scope.row.refundAmount">退货金额：{{scope.row.refundAmount}}</div>
          </template>
        </el-table-column>
        <el-table-column label="退货金额" prop="refundAmount" align="right"/>
        <el-table-column label="支付金额" prop="paidAmount" align="right"/>
        <el-table-column label="总金额"  align="right">
          <template #default="scope">
            {{ getTotalAmount(scope.row.goodsAmount, scope.row.otherExpensesAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="优惠金额" prop="discountAmount" align="right"/>
        <el-table-column label="实际金额" prop="actualAmount" align="right"/>
        <el-table-column label="备注" prop="remark" />
        <el-table-column label="操作" align="right" class-name="small-padding fixed-width" width="120">
          <template #default="scope">
            <div>
              <el-popover
                placement="left"
                title="提示"
                :width="300"
                trigger="hover"
                :disabled="scope.row.checkedStatus === 0"
                :content="'出库单【' + scope.row.docNo + '】已完成，无法修改！' "
              >
                <template #reference>
                  <el-button link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['sales:order:all']" :disabled="[1].includes(scope.row.checkedStatus)">修改</el-button>
                </template>
              </el-popover>
              <el-button link type="primary" @click="handleGoDetail(scope.row)" v-hasPermi="['sales:order:all']">{{ expandedRowKeys.includes(scope.row.id) ? '收起' : '查看' }}</el-button>
            </div>
            <div>
              <el-popover
                placement="left"
                title="提示"
                :width="300"
                trigger="hover"
                :disabled="scope.row.checkedStatus === 0"
                :content="'出库单【' + scope.row.docNo + '】已完成，无法删除！' "
              >
                <template #reference>
                  <el-button type="danger" @click="handleDelete(scope.row)" link v-hasPermi="['sales:order:all']" :disabled="[1].includes(scope.row.checkedStatus)">删除</el-button>
                </template>
              </el-popover>
              <el-popover
                placement="left"
                title="提示"
                :width="300"
                trigger="hover"
                :disabled="scope.row.checkedStatus === 1"
                :content="'出库单【' + scope.row.docNo + '】未完成，无法退货！' "
              >
                <template #reference>
                  <el-button type="danger" @click="handleRefund(scope.row)" link v-hasPermi="['wms:check:all']" :disabled="[0].includes(scope.row.checkedStatus)">退货</el-button>
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

<script setup name="Trade">
import { listTrade,  delTrade, addTrade, updateTrade } from "@/api/sales/trade";
import {useBasicStore} from "@/store/modules/basic";
import {listByTradeId} from "@/api/sales/tradeDetail";
import {useRoute} from "vue-router";
import {getCurrentInstance, onMounted, reactive, ref, toRefs} from "vue";
const expandedRowKeys = ref([])
const { proxy } = getCurrentInstance();
const { finish_status } = proxy.useDict('finish_status');
const { refund_status } = proxy.useDict('refund_status');
const tradeList = ref([]);
const open = ref(false);
const buttonLoading = ref(false);
const loading = ref(true);
const ids = ref([]);
const total = ref(0);
const title = ref("");
const daterangeBillDate = ref([]);
const detailLoading = ref([])
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    docNo: undefined,
    checkedStatus: undefined,
  },
});

const { queryParams, form, rules } = toRefs(data);
/** 计算总金额*/
function getTotalAmount(goodsAmount, otherExpensesAmount) {
  const validGoodsAmount = isNaN(parseFloat(goodsAmount))? 0 : parseFloat(goodsAmount);
  const validOtherExpensesAmount = isNaN(parseFloat(otherExpensesAmount))? 0 : parseFloat(otherExpensesAmount);
  const total = validGoodsAmount + validOtherExpensesAmount;
  return total.toFixed(2);
}
/** 查询销售出库单列表 */
function getList() {
  queryParams.value.params = {};
  loading.value = true;
  if (null != daterangeBillDate && '' != daterangeBillDate) {
    queryParams.value.params["beginBillDate"] = daterangeBillDate.value[0];
    queryParams.value.params["endBillDate"] = daterangeBillDate.value[1];
  }
  listTrade(queryParams.value).then(response => {
    expandedRowKeys.value = []
    tradeList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
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

function loadTradeDetail(row) {
  const index = tradeList.value.findIndex(it => it.id === row.id)
  detailLoading.value[index] = true
  listByTradeId(row.id).then(res => {
    if (res.data?.length) {
      const details = res.data.map(it => {
        return {
          ...it,
          warehouseName: useBasicStore().warehouseMap.get(it.warehouseId)?.warehouseName,
        }
      })
      tradeList.value[index].details = details
    }
  }).finally(() => {
    detailLoading.value[index] = false
  })
}

function handleGoDetail(row) {
  const index = expandedRowKeys.value.indexOf(row.id)
  if (index !== -1) {
    // 收起
    expandedRowKeys.value.splice(index, 1)
  } else {
    // 展开
    expandedRowKeys.value.push(row.id)
    loadTradeDetail(row)
  }
}
function handleRefund(row){
  proxy.$router.push({ path: "/sales/refundEdit",  query: { tradeNo: row.docNo ,tradeId: row.id ,merchantId: row.merchantId} });
}

function handleExpandExchange(value, expandedRows) {
  if (!ifExpand(expandedRows)) {
    return
  }
  expandedRowKeys.value = expandedRows.map(it => it.id)
  loadTradeDetail(value)
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
    orderId: null,
    orderNo: null,
    docNo: null,
    docDate: null,
    checkedStatus: null,
    refundStatus: null,
    refundAmount: null,
    paidAmount: null,
    checkedBy: null,
    merchantId: null,
    goodsQty: null,
    goodsAmount: null,
    otherExpensesAmount: null,
    discountAmount: null,
    actualAmount: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("tradeRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeBillDate.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 新增按钮操作 */
function handleAdd() {
  proxy.$router.push({ path: "/sales/tradeEdit" });
}

/** 修改按钮操作 */
function handleUpdate(row) {
  proxy.$router.push({ path: "/sales/tradeEdit",  query: { id: row.id } });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["tradeRef"].validate(valid => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id != null) {
        updateTrade(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        }).finally(() => {
          buttonLoading.value = false;
        });
      } else {
        addTrade(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除入库单编号为"' + docNo + '"的数据项？').then(function() {
    loading.value = true;
    return delTrade(_ids);
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
  proxy.download('sales/trade/export', {
    ...queryParams.value
  }, `trade_${new Date().getTime()}.xlsx`)
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
