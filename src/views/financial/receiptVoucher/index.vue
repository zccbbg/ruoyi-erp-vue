<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
              <el-form-item label="编号" prop="voucherNo">
                <el-input
                  v-model="queryParams.voucherNo"
                  placeholder="请输入编号"
                  clearable
                  @keyup.enter="handleQuery"
                />
              </el-form-item>
              <el-form-item label="收款日期" style="width: 308px">
                <el-date-picker
                  v-model="daterangeTransDate"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  type="daterange"
                  range-separator="-"
                  start-placeholder="开始日期"
                  :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="往来单位" prop="merchantId">
                <el-select v-model="form.merchantId" placeholder="请选择供应商" clearable filterable style="width:100%">
                  <el-option v-for="item in useBasicStore().merchantList" :key="item.id" :label="item.merchantName" :value="item.id"/>
                </el-select>
              </el-form-item>
              <el-form-item label="银行账户" prop="bankAccountId">
                <el-select v-model="form.bankAccountId" placeholder="请选择银行账户" clearable filterable style="width:100%">
                  <el-option v-for="item in useBasicStore().bankAccountList" :key="item.id" :label="item.accountName" :value="item.id"/>
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
        <el-col :span="6"><span style="font-size: large">收款单</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['financial:receiptVoucher:add']"
          >新增</el-button>
<!--          <el-button-->
<!--            type="warning"-->
<!--            plain-->
<!--            icon="Download"-->
<!--            @click="handleExport"-->
<!--            v-hasPermi="['financial:receiptVoucher:export']"-->
<!--          >导出</el-button>-->
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="receiptVoucherList" border class="mt20">
            <el-table-column label="" prop="id" v-if="true"/>
            <el-table-column label="编号" prop="voucherNo" />
            <el-table-column label="收款日期" align="center" prop="transDate" width="180">
              <template #default="scope">
                <span>{{ parseTime(scope.row.transDate, '{y}-{m}-{d}') }}</span>
              </template>
            </el-table-column>
            <el-table-column label="往来单位" prop="merchantId" >
              <template #default="{ row }">
                <div>{{ useBasicStore().merchantMap.get(row.merchantId)?.merchantName }}</div>
              </template>
            </el-table-column>
            <el-table-column label="银行账户" prop="bankAccountId">
              <template #default="{ row }">
                <div>{{ useBasicStore().bankAccountMap.get(row.bankAccountId)?.accountName }}</div>
              </template>
            </el-table-column>
            <el-table-column label="总金额" prop="totalAmount" />
            <el-table-column label="优惠金额" prop="discountAmount" />
            <el-table-column label="支付金额" prop="paidAmount" />
            <el-table-column label="审核状态" prop="checkedStatus" />
            <el-table-column label="备注" prop="remark" />
        <el-table-column label="操作" align="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['financial:receiptVoucher:edit']">修改</el-button>
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['financial:receiptVoucher:remove']">删除</el-button>
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
    <!-- 添加或修改收款单对话框 -->
    <el-drawer :title="title" v-model="open" size="50%" append-to-body>
      <el-form ref="receiptVoucherRef" :model="form" :rules="rules" label-width="80px">
              <el-form-item label="编号" prop="voucherNo">
                <el-input v-model="form.voucherNo" placeholder="请输入编号" />
              </el-form-item>
              <el-form-item label="收款日期" prop="transDate">
                <el-date-picker clearable
                                v-model="form.transDate"
                                type="date"
                                value-format="YYYY-MM-DD"
                                placeholder="请选择收款日期">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="往来单位" prop="merchantId">
                <el-select v-model="form.merchantId" placeholder="请选择供应商" clearable filterable style="width:100%">
                  <el-option v-for="item in useBasicStore().merchantList" :key="item.id" :label="item.merchantName" :value="item.id"/>
                </el-select>
              </el-form-item>
              <el-form-item label="银行账户" prop="bankAccountId">
                <el-select v-model="form.bankAccountId" placeholder="请选择银行账户" clearable filterable style="width:100%">
                  <el-option v-for="item in useBasicStore().bankAccountList" :key="item.id" :label="item.accountName" :value="item.id"/>
                </el-select>
              </el-form-item>
              <el-form-item label="总金额" prop="totalAmount">
                <el-input-number :controls="false" style="width:100%;" :precision="2" v-model="form.totalAmount" placeholder="请输入总金额" />
              </el-form-item>
              <el-form-item label="优惠金额" prop="discountAmount">
                <el-input-number :controls="false" style="width:100%;" :precision="2" v-model="form.discountAmount" placeholder="请输入优惠金额" />
              </el-form-item>
              <el-form-item label="支付金额" prop="paidAmount">
                <el-input-number :controls="false" style="width:100%;" :precision="2" v-model="form.paidAmount" placeholder="请输入支付金额" />
              </el-form-item>
              <el-form-item label="备注" prop="remark">
                <el-input v-model="form.remark" placeholder="请输入备注" />
              </el-form-item>
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

<script setup name="ReceiptVoucher">
  import { listReceiptVoucher, getReceiptVoucher, delReceiptVoucher, addReceiptVoucher, updateReceiptVoucher } from "@/api/financial/receiptVoucher";
  import {useBasicStore} from "@/store/modules/basic";
  import { numSub, generateNo } from '@/utils/ruoyi'

const { proxy } = getCurrentInstance();

  const receiptVoucherList = ref([]);
  const open = ref(false);
  const buttonLoading = ref(false);
  const loading = ref(true);
  const ids = ref([]);
  const total = ref(0);
  const title = ref("");
    const daterangeTransDate = ref([]);

  const data = reactive({
    form: {},
    queryParams: {
      pageNum: 1,
      pageSize: 10,
    voucherNo: undefined,
    transDate: undefined,
    merchantId: undefined,
    bankAccountId: undefined,
  },
  rules: {
    id: [
      { required: true, message: "不能为空", trigger: "blur" }
    ],
    voucherNo: [
      { required: true, message: "编号不能为空", trigger: "blur" }
    ],
    transDate: [
      { required: true, message: "收款日期不能为空", trigger: "blur" }
    ],
    merchantId: [
      { required: true, message: "往来单位id不能为空", trigger: "blur" }
    ],
    bankAccountId: [
      { required: true, message: "银行账户id不能为空", trigger: "blur" }
    ],
    paidAmount: [
      { required: true, message: "支付金额不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询收款单列表 */
function getList() {
  loading.value = true;
    queryParams.value.params = {};
  if (null != daterangeTransDate && '' != daterangeTransDate) {
    queryParams.value.params["beginTransDate"] = daterangeTransDate.value[0];
    queryParams.value.params["endTransDate"] = daterangeTransDate.value[1];
  }
  listReceiptVoucher(queryParams.value).then(response => {
  receiptVoucherList.value = response.rows;
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
    voucherNo: null,
    transDate: null,
    merchantId: null,
    bankAccountId: null,
    paidAmount: null,
    discountAmount: null,
    totalAmount: null,
    checkedStatus: null,
    checkedBy: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  };
  proxy.resetForm("receiptVoucherRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

    /** 重置按钮操作 */
    function resetQuery() {
      daterangeTransDate.value = [];
    proxy.resetForm("queryRef");
    handleQuery();
  }

  /** 新增按钮操作 */
  function handleAdd() {
    reset();
    form.value.voucherNo = 'SKD' +generateNo();
    open.value = true;
    title.value = "添加收款单";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getReceiptVoucher(_id).then(response => {
    form.value = response.data;
  open.value = true;
  title.value = "修改收款单";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["receiptVoucherRef"].validate(valid => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id != null) {
        updateReceiptVoucher(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        }).finally(() => {
          buttonLoading.value = false;
        });
      } else {
        addReceiptVoucher(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除收款单编号为"' + _ids + '"的数据项？').then(function() {
    loading.value = true;
    return delReceiptVoucher(_ids);
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
  proxy.download('financial/receiptVoucher/export', {
    ...queryParams.value
  }, `receiptVoucher_${new Date().getTime()}.xlsx`)
}

getList();
</script>
<style scoped>
:deep(.el-input-number .el-input__inner){
  text-align: left;
  line-height: 1;
  -webkit-appearance: none;
  -moz-appearance: textfield;
}
</style>
