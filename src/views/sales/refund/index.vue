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
        <el-form-item label="审核状态" prop="checkedStatus">
          <el-select v-model="queryParams.checkedStatus" placeholder="请选择审核状态" clearable>
            <el-option
              v-for="dict in finish_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
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
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt20">

      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="6"><span style="font-size: large">销售退货单</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['sales:refund:add']"
          >新增</el-button>
<!--          <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['sales:refund:export']"
          >导出</el-button>-->
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="refundList" border class="mt20" :row-key="getRowKey" :expand-row-keys="expandedRowKeys" @expand-change="handleExpandExchange">
        <el-table-column type="expand">
          <template #default="props">
            <div style="padding: 0 50px 20px 50px">
              <el-descriptions>
                <el-descriptions-item label="入库单编号:">{{props.row.tradeNo}}</el-descriptions-item>
                <el-descriptions-item label="商品金额:">{{props.row.goodsAmount}}</el-descriptions-item>
                <el-descriptions-item label="其他费用:">{{props.row.otherExpensesAmount}}</el-descriptions-item>
                <el-descriptions-item label="本次收款:">{{props.row.paidAmount}}</el-descriptions-item>
                <el-descriptions-item label="剩余收款:">{{props.row.actualAmount - props.row.paidAmount}}</el-descriptions-item>
              </el-descriptions>
              <h3>商品明细</h3>
              <el-table :data="props.row.details" v-loading="detailLoading[props.$index]" empty-text="暂无商品明细" show-summary  :summary-method="getSummaries">
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
        <el-table-column label="单据编号" prop="docNo" align="center" />
        <el-table-column label="单据日期" align="center" prop="docDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.docDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="供应商" prop="merchantId" min-width="120" align="center">
          <template #default="{ row }">
            <div>{{ useBasicStore().merchantMap.get(row.merchantId)?.merchantName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" align="center">
          <template #default="scope">
            <dict-tag :options="finish_status" :value="scope.row.checkedStatus"/>
          </template>
        </el-table-column>
        <el-table-column label="退货金额" prop="goodsAmount" align="right"/>
        <el-table-column label="总金额" align="right">
          <template #default="scope">
            {{ getTotalAmount(scope.row.goodsAmount, scope.row.otherExpensesAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="优惠金额" prop="discountAmount" align="right"/>
        <el-table-column label="实际金额" prop="actualAmount" align="right"/>
        <el-table-column label="备注" prop="remark" align="center"/>
        <el-table-column label="操作" align="right" class-name="small-padding fixed-width" width="120">
          <template #default="scope">
            <div>
              <el-popover
                placement="left"
                title="提示"
                :width="300"
                trigger="hover"
                :disabled="scope.row.checkedStatus === 0"
                :content="'退货单【' + scope.row.docNo + '】已完成，无法修改！' "
              >
                <template #reference>
                  <el-button link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['purchase:refund:all']" :disabled="[1].includes(scope.row.checkedStatus)">修改</el-button>
                </template>
              </el-popover>
              <el-button link type="primary" @click="handleGoDetail(scope.row)" v-hasPermi="['purchase:refund:all']">{{ expandedRowKeys.includes(scope.row.id) ? '收起' : '查看' }}</el-button>
            </div>
            <div>
              <el-popover
                placement="left"
                title="提示"
                :width="300"
                trigger="hover"
                :disabled="scope.row.checkedStatus === 0"
                :content="'退货单【' + scope.row.docNo + '】已完成，无法删除！' "
              >
                <template #reference>
                  <el-button type="danger" @click="handleDelete(scope.row)" link v-hasPermi="['purchase:refund:all']" :disabled="[1].includes(scope.row.checkedStatus)">删除</el-button>
                </template>
              </el-popover>
              <el-button link type="primary" @click="handlePrint(scope.row)" v-hasPermi="['wms:check:all']">打印</el-button>
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
    <!-- 添加或修改销售退货单对话框 -->

  </div>
</template>

<script setup name="Refund">
import {listRefund, delRefund, addRefund, updateRefund, getRefund} from "@/api/sales/refund";
import {ElMessage, ElMessageBox} from "element-plus";
import {getCurrentInstance, onMounted, reactive, ref, toRefs} from "vue";
import {useBasicStore} from "@/store/modules/basic";
import {parseTime} from "@/utils/ruoyi";
import {listRefundDetailById} from "@/api/sales/refundDetail";
import {useRoute} from "vue-router";
import {getSummaries, getTotalAmount} from "@/utils/wmsUtil";

const { proxy } = getCurrentInstance();
const detailLoading = ref([]);
let refundList = reactive([]);
const open = ref(false);
const buttonLoading = ref(false);
const loading = ref(true);
const ids = ref([]);
const total = ref(0);
const title = ref("");
const daterangeBillDate = ref([]);
const expandedRowKeys = ref([]);
const { finish_status } = proxy.useDict('finish_status');
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tradeId: undefined,
    billNo: undefined,
    billDate: undefined,
    checkedStatus: undefined,
    checkedBy: undefined,
    merchantId: undefined,
    goodsQty: undefined,
    goodsAmount: undefined,
    otherExpensesAmount: undefined,
    discountAmount: undefined,
    actualAmount: undefined,
    paidAmount: undefined,
    deductedAmount: undefined,
    dueAmount: undefined,
  },
  rules: {
    id: [
      { required: true, message: "不能为空", trigger: "blur" }
    ],
    tradeId: [
      { required: true, message: "trade id不能为空", trigger: "blur" }
    ],
    billNo: [
      { required: true, message: "单据编号不能为空", trigger: "blur" }
    ],
    billDate: [
      { required: true, message: "单据日期不能为空", trigger: "blur" }
    ],
    checkedStatus: [
      { required: true, message: "审核状态不能为空", trigger: "change" }
    ],
    checkedBy: [
      { required: true, message: "审核人不能为空", trigger: "blur" }
    ],
    merchantId: [
      { required: true, message: "供应商id不能为空", trigger: "blur" }
    ],
    goodsQty: [
      { required: true, message: "商品数量不能为空", trigger: "blur" }
    ],
    goodsAmount: [
      { required: true, message: "商品金额不能为空", trigger: "blur" }
    ],
    otherExpensesAmount: [
      { required: true, message: "其他费用不能为空", trigger: "blur" }
    ],
    discountAmount: [
      { required: true, message: "优惠金额不能为空", trigger: "blur" }
    ],
    actualAmount: [
      { required: true, message: "实际金额不能为空", trigger: "blur" }
    ],
    paidAmount: [
      { required: true, message: "已支付退款金额不能为空", trigger: "blur" }
    ],
    deductedAmount: [
      { required: true, message: "已抵扣退款金额不能为空", trigger: "blur" }
    ],
    dueAmount: [
      { required: true, message: "未付金额不能为空", trigger: "blur" }
    ],
    remark: [
      { required: true, message: "备注不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);


/** 查询销售退货单列表 */
function getList() {
  queryParams.value.params = {};
  loading.value = true;
  if (null != daterangeBillDate && '' != daterangeBillDate) {
    queryParams.value.params["beginBillDate"] = daterangeBillDate.value[0];
    queryParams.value.params["endBillDate"] = daterangeBillDate.value[1];
  }
  listRefund(queryParams.value).then(response => {
    refundList = response.rows.map(order => ({
      ...order,
      details: [] // 提前声明
    }))
    total.value = response.total;
    loading.value = false;
  });
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
    tradeId: null,
    billNo: null,
    billDate: null,
    checkedStatus: null,
    checkedBy: null,
    merchantId: null,
    goodsQty: null,
    goodsAmount: null,
    otherExpensesAmount: null,
    discountAmount: null,
    actualAmount: null,
    paidAmount: null,
    deductedAmount: null,
    dueAmount: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("refundRef");
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
  ElMessageBox.confirm('请去销售入库单模块进行退单操作', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 用户点击确定按钮
    proxy.$router.push({ path: "/sales/trade" });
  }).catch(() => {
    // 用户点击取消按钮
    ElMessage.info('已取消操作');
  });
}

/** 修改按钮操作 */
function handleUpdate(row) {
  proxy.$router.push({ path: "/sales/refundEdit",  query: { id: row.id } });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["refundRef"].validate(valid => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id != null) {
        updateRefund(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        }).finally(() => {
          buttonLoading.value = false;
        });
      } else {
        addRefund(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除销售退货单编号为"' + _ids + '"的数据项？').then(function() {
    loading.value = true;
    return delRefund(_ids);
  }).then(() => {
    loading.value = true;
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  }).finally(() => {
    loading.value = false;
  });
}
function handleGoDetail(row) {
  const index = expandedRowKeys.value.indexOf(row.id)
  if (index !== -1) {
    // 收起
    expandedRowKeys.value.splice(index, 1)
  } else {
    // 展开
    expandedRowKeys.value.push(row.id)
    loadRefundDetail(row)
  }
}
function loadRefundDetail(row) {
  const index = refundList.findIndex(it => it.id === row.id)
  detailLoading.value[index] = true
  listRefundDetailById(row.id).then(res => {
    if (res.data?.length) {
      const details = res.data.map(it => {
        return {
          ...it,
          warehouseName: useBasicStore().warehouseMap.get(it.warehouseId)?.warehouseName,
        }
      })
      refundList[index].details = details
    }
  }).finally(() => {
    detailLoading.value[index] = false
  })
}
function getRowKey(row) {
  return row.id
}
function handleExpandExchange(value, expandedRows) {
  if (!ifExpand(expandedRows)) {
    return
  }
  expandedRowKeys.value = expandedRows.map(it => it.id)
  loadRefundDetail(value)
}
function ifExpand(expandedRows) {
  if (expandedRows.length < expandedRowKeys.value.length) {
    expandedRowKeys.value = expandedRows.map(it => it.id)
    return false;
  }
  return true
}
/** 导出按钮操作 */
/*function handleExport() {
  proxy.download('sales/refund/export', {
    ...queryParams.value
  }, `refund_${new Date().getTime()}.xlsx`)
}*/

const route = useRoute();
onMounted(() => {
  const relatedNo = route.query && route.query.relatedNo;
  if (relatedNo) {
    queryParams.value.docNo = relatedNo;
  }
  getList();
})
</script>
