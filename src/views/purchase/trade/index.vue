<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
        <el-form-goods label="订单id" prop="orderId">
          <el-input
            v-model="queryParams.orderId"
            placeholder="请输入订单id"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-goods>
        <el-form-goods label="单据编号" prop="billNo">
          <el-input
            v-model="queryParams.billNo"
            placeholder="请输入单据编号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-goods>
        <el-form-goods label="单据日期" prop="billDate">
          <el-date-picker clearable
            v-model="queryParams.billDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择单据日期">
          </el-date-picker>
        </el-form-goods>
        <el-form-goods label="退货金额" prop="refundAmount">
          <el-input
            v-model="queryParams.refundAmount"
            placeholder="请输入退货金额"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-goods>
        <el-form-goods label="退货抵扣" prop="deductedRefundAmount">
          <el-input
            v-model="queryParams.deductedRefundAmount"
            placeholder="请输入退货抵扣"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-goods>
        <el-form-goods label="预付款抵扣" prop="deductedPrepayAmount">
          <el-input
            v-model="queryParams.deductedPrepayAmount"
            placeholder="请输入预付款抵扣"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-goods>
        <el-form-goods label="支付金额" prop="paidAmount">
          <el-input
            v-model="queryParams.paidAmount"
            placeholder="请输入支付金额"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-goods>
        <el-form-goods label="剩余金额" prop="dueAmount">
          <el-input
            v-model="queryParams.dueAmount"
            placeholder="请输入剩余金额"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-goods>
        <el-form-goods label="审核人" prop="checkedBy">
          <el-input
            v-model="queryParams.checkedBy"
            placeholder="请输入审核人"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-goods>
        <el-form-goods label="供应商id" prop="merchantId">
          <el-input
            v-model="queryParams.merchantId"
            placeholder="请输入供应商id"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-goods>
        <el-form-goods label="商品数量" prop="goodsQty">
          <el-input
            v-model="queryParams.goodsQty"
            placeholder="请输入商品数量"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-goods>
        <el-form-goods label="商品金额" prop="goodsAmount">
          <el-input
            v-model="queryParams.goodsAmount"
            placeholder="请输入商品金额"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-goods>
        <el-form-goods label="其他费用" prop="otherExpensesAmount">
          <el-input
            v-model="queryParams.otherExpensesAmount"
            placeholder="请输入其他费用"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-goods>
        <el-form-goods label="优惠金额" prop="discountAmount">
          <el-input
            v-model="queryParams.discountAmount"
            placeholder="请输入优惠金额"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-goods>
        <el-form-goods label="实际金额" prop="actualAmount">
          <el-input
            v-model="queryParams.actualAmount"
            placeholder="请输入实际金额"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-goods>
        <el-form-goods>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-goods>
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
          <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['purchase:trade:export']"
          >导出</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="tradeList" border class="mt20">
        <el-table-column label="" prop="id" v-if="true"/>
        <el-table-column label="订单id" prop="orderId" />
        <el-table-column label="单据编号" prop="billNo" />
        <el-table-column label="单据日期" align="center" prop="billDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.billDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" prop="checkedStatus" />
        <el-table-column label="支付状态" prop="paymentStatus" />
        <el-table-column label="退货状态" prop="refundStatus" />
        <el-table-column label="退货金额" prop="refundAmount" />
        <el-table-column label="退货抵扣" prop="deductedRefundAmount" />
        <el-table-column label="预付款抵扣" prop="deductedPrepayAmount" />
        <el-table-column label="支付金额" prop="paidAmount" />
        <el-table-column label="剩余金额" prop="dueAmount" />
        <el-table-column label="审核人" prop="checkedBy" />
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
    <!-- 添加或修改采购入库单对话框 -->
    <el-drawer :title="title" v-model="open" size="50%" append-to-body>
      <el-form ref="tradeRef" :model="form" :rules="rules" label-width="80px">
        <el-form-goods label="订单id" prop="orderId">
          <el-input v-model="form.orderId" placeholder="请输入订单id" />
        </el-form-goods>
        <el-form-goods label="单据编号" prop="billNo">
          <el-input v-model="form.billNo" placeholder="请输入单据编号" />
        </el-form-goods>
        <el-form-goods label="单据日期" prop="billDate">
          <el-date-picker clearable
            v-model="form.billDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择单据日期">
          </el-date-picker>
        </el-form-goods>
        <el-form-goods label="退货金额" prop="refundAmount">
          <el-input v-model="form.refundAmount" placeholder="请输入退货金额" />
        </el-form-goods>
        <el-form-goods label="退货抵扣" prop="deductedRefundAmount">
          <el-input v-model="form.deductedRefundAmount" placeholder="请输入退货抵扣" />
        </el-form-goods>
        <el-form-goods label="预付款抵扣" prop="deductedPrepayAmount">
          <el-input v-model="form.deductedPrepayAmount" placeholder="请输入预付款抵扣" />
        </el-form-goods>
        <el-form-goods label="支付金额" prop="paidAmount">
          <el-input v-model="form.paidAmount" placeholder="请输入支付金额" />
        </el-form-goods>
        <el-form-goods label="剩余金额" prop="dueAmount">
          <el-input v-model="form.dueAmount" placeholder="请输入剩余金额" />
        </el-form-goods>
        <el-form-goods label="审核人" prop="checkedBy">
          <el-input v-model="form.checkedBy" placeholder="请输入审核人" />
        </el-form-goods>
        <el-form-goods label="供应商id" prop="merchantId">
          <el-input v-model="form.merchantId" placeholder="请输入供应商id" />
        </el-form-goods>
        <el-form-goods label="商品数量" prop="goodsQty">
          <el-input v-model="form.goodsQty" placeholder="请输入商品数量" />
        </el-form-goods>
        <el-form-goods label="商品金额" prop="goodsAmount">
          <el-input v-model="form.goodsAmount" placeholder="请输入商品金额" />
        </el-form-goods>
        <el-form-goods label="其他费用" prop="otherExpensesAmount">
          <el-input v-model="form.otherExpensesAmount" placeholder="请输入其他费用" />
        </el-form-goods>
        <el-form-goods label="优惠金额" prop="discountAmount">
          <el-input v-model="form.discountAmount" placeholder="请输入优惠金额" />
        </el-form-goods>
        <el-form-goods label="实际金额" prop="actualAmount">
          <el-input v-model="form.actualAmount" placeholder="请输入实际金额" />
        </el-form-goods>
        <el-form-goods label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-goods>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="Trade">
import { listTrade, getTrade, delTrade, addTrade, updateTrade } from "@/api/purchase/trade";

const { proxy } = getCurrentInstance();

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
    orderId: undefined,
    billNo: undefined,
    billDate: undefined,
    checkedStatus: undefined,
    paymentStatus: undefined,
    refundStatus: undefined,
    refundAmount: undefined,
    deductedRefundAmount: undefined,
    deductedPrepayAmount: undefined,
    paidAmount: undefined,
    dueAmount: undefined,
    checkedBy: undefined,
    merchantId: undefined,
    goodsQty: undefined,
    goodsAmount: undefined,
    otherExpensesAmount: undefined,
    discountAmount: undefined,
    actualAmount: undefined,
  },
  rules: {
    id: [
      { required: true, message: "不能为空", trigger: "blur" }
    ],
    orderId: [
      { required: true, message: "订单id不能为空", trigger: "blur" }
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
    paymentStatus: [
      { required: true, message: "支付状态不能为空", trigger: "change" }
    ],
    refundStatus: [
      { required: true, message: "退货状态不能为空", trigger: "change" }
    ],
    refundAmount: [
      { required: true, message: "退货金额不能为空", trigger: "blur" }
    ],
    deductedRefundAmount: [
      { required: true, message: "退货抵扣不能为空", trigger: "blur" }
    ],
    deductedPrepayAmount: [
      { required: true, message: "预付款抵扣不能为空", trigger: "blur" }
    ],
    paidAmount: [
      { required: true, message: "支付金额不能为空", trigger: "blur" }
    ],
    dueAmount: [
      { required: true, message: "剩余金额不能为空", trigger: "blur" }
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
    remark: [
      { required: true, message: "备注不能为空", trigger: "blur" }
    ],
  }
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
    billNo: null,
    billDate: null,
    checkedStatus: null,
    paymentStatus: null,
    refundStatus: null,
    refundAmount: null,
    deductedRefundAmount: null,
    deductedPrepayAmount: null,
    paidAmount: null,
    dueAmount: null,
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
  reset();
  open.value = true;
  title.value = "添加采购入库单";
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
