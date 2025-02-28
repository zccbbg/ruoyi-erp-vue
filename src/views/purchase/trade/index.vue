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
        <el-col :span="6"><span style="font-size: large">采购入库单</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['purchase:trade:add']"
          >新增</el-button>
<!--          <el-button-->
<!--            type="warning"-->
<!--            plain-->
<!--            icon="Download"-->
<!--            @click="handleExport"-->
<!--            v-hasPermi="['purchase:trade:export']"-->
<!--          >导出</el-button>-->
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="tradeList" border class="mt20">
        <el-table-column label="" prop="id" v-if="false"/>
        <el-table-column label="单据编号" prop="docNo" />
        <el-table-column label="单据日期" align="center" prop="docDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.docDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" prop="checkedStatus" />
        <el-table-column label="退货状态" prop="refundStatus" />
        <el-table-column label="退货金额" prop="refundAmount" />
        <el-table-column label="支付金额" prop="paidAmount" />
        <el-table-column label="供应商id" prop="merchantId" />
        <el-table-column label="商品数量" prop="goodsQty" />
        <el-table-column label="商品金额" prop="goodsAmount" />
        <el-table-column label="其他费用" prop="otherExpensesAmount" />
        <el-table-column label="优惠金额" prop="discountAmount" />
        <el-table-column label="实际金额" prop="actualAmount" />
        <el-table-column label="备注" prop="remark" />
        <el-table-column label="操作" align="right" class-name="small-padding fixed-width">
            <template #default="scope">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['purchase:trade:edit']">修改</el-button>
                <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['purchase:trade:remove']">删除</el-button>
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
import { listTrade, getTrade, delTrade, addTrade, updateTrade } from "@/api/purchase/trade";

const { proxy } = getCurrentInstance();
const { finish_status } = proxy.useDict('finish_status');
const tradeList = ref([]);
const open = ref(false);
const buttonLoading = ref(false);
const loading = ref(true);
const ids = ref([]);
const total = ref(0);
const title = ref("");

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

/** 查询采购入库单列表 */
function getList() {
  loading.value = true;
  listTrade(queryParams.value).then(response => {
    tradeList.value = response.rows;
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
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 新增按钮操作 */
function handleAdd() {
  proxy.$router.push({ path: "/purchase/tradeEdit" });
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getTrade(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改采购入库单";
  });
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
  proxy.$modal.confirm('是否确认删除采购入库单编号为"' + _ids + '"的数据项？').then(function() {
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
  proxy.download('purchase/trade/export', {
    ...queryParams.value
  }, `trade_${new Date().getTime()}.xlsx`)
}

getList();
</script>
