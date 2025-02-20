<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
              <el-form-item label="商家id" prop="merchantId">
                <el-input
                  v-model="queryParams.merchantId"
                  placeholder="请输入商家id"
                  clearable
                  @keyup.enter="handleQuery"
                />
              </el-form-item>
              <el-form-item label="银行账户id" prop="bankAccountId">
                <el-input
                  v-model="queryParams.bankAccountId"
                  placeholder="请输入银行账户id"
                  clearable
                  @keyup.enter="handleQuery"
                />
              </el-form-item>
              <el-form-item label="关联业务编号" prop="relatedNo">
                <el-input
                  v-model="queryParams.relatedNo"
                  placeholder="请输入关联业务编号"
                  clearable
                  @keyup.enter="handleQuery"
                />
              </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt20">

      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="6"><span style="font-size: large">交易流水</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['financial:transHistory:add']"
          >新增</el-button>
          <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['financial:transHistory:export']"
          >导出</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="transHistoryList" border class="mt20">
            <el-table-column label="" prop="id" v-if="true"/>
            <el-table-column label="商家id" prop="merchantId" />
            <el-table-column label="银行账户id" prop="bankAccountId" />
            <el-table-column label="交易类型" prop="transType" />
            <el-table-column label="关联业务id" prop="relatedId" />
            <el-table-column label="关联业务编号" prop="relatedNo" />
            <el-table-column label="总金额" prop="totalAmount" />
            <el-table-column label="优惠金额" prop="discountAmount" />
            <el-table-column label="实际金额" prop="actualAmount" />
            <el-table-column label="支付金额" prop="paidAmount" />
            <el-table-column label="余额变动" prop="balanceChange" />
            <el-table-column label="交易前余额" prop="beforeBalance" />
            <el-table-column label="交易后余额" prop="afterBalance" />
            <el-table-column label="创建人" prop="createBy" />
            <el-table-column label="创建时间" align="center" prop="createTime" width="180">
              <template #default="scope">
                <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
              </template>
            </el-table-column>
        <el-table-column label="操作" align="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['financial:transHistory:edit']">修改</el-button>
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['financial:transHistory:remove']">删除</el-button>
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
    <!-- 添加或修改交易流水对话框 -->
    <el-drawer :title="title" v-model="open" size="50%" append-to-body>
      <el-form ref="transHistoryRef" :model="form" :rules="rules" label-width="80px">
              <el-form-item label="商家id" prop="merchantId">
                <el-input v-model="form.merchantId" placeholder="请输入商家id" />
              </el-form-item>
              <el-form-item label="银行账户id" prop="bankAccountId">
                <el-input v-model="form.bankAccountId" placeholder="请输入银行账户id" />
              </el-form-item>
              <el-form-item label="关联业务id" prop="relatedId">
                <el-input v-model="form.relatedId" placeholder="请输入关联业务id" />
              </el-form-item>
              <el-form-item label="关联业务编号" prop="relatedNo">
                <el-input v-model="form.relatedNo" placeholder="请输入关联业务编号" />
              </el-form-item>
              <el-form-item label="总金额" prop="totalAmount">
                <el-input v-model="form.totalAmount" placeholder="请输入总金额" />
              </el-form-item>
              <el-form-item label="优惠金额" prop="discountAmount">
                <el-input v-model="form.discountAmount" placeholder="请输入优惠金额" />
              </el-form-item>
              <el-form-item label="实际金额" prop="actualAmount">
                <el-input v-model="form.actualAmount" placeholder="请输入实际金额" />
              </el-form-item>
              <el-form-item label="支付金额" prop="paidAmount">
                <el-input v-model="form.paidAmount" placeholder="请输入支付金额" />
              </el-form-item>
              <el-form-item label="余额变动" prop="balanceChange">
                <el-input v-model="form.balanceChange" placeholder="请输入余额变动" />
              </el-form-item>
              <el-form-item label="交易前余额" prop="beforeBalance">
                <el-input v-model="form.beforeBalance" placeholder="请输入交易前余额" />
              </el-form-item>
              <el-form-item label="交易后余额" prop="afterBalance">
                <el-input v-model="form.afterBalance" placeholder="请输入交易后余额" />
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

<script setup name="TransHistory">
  import { listTransHistory, getTransHistory, delTransHistory, addTransHistory, updateTransHistory } from "@/api/financial/transHistory";

const { proxy } = getCurrentInstance();

  const transHistoryList = ref([]);
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
    merchantId: undefined,
    bankAccountId: undefined,
    transType: undefined,
    relatedNo: undefined,
  },
  rules: {
    id: [
      { required: true, message: "不能为空", trigger: "blur" }
    ],
    merchantId: [
      { required: true, message: "商家id不能为空", trigger: "blur" }
    ],
    bankAccountId: [
      { required: true, message: "银行账户id不能为空", trigger: "blur" }
    ],
    transType: [
      { required: true, message: "交易类型不能为空", trigger: "change" }
    ],
    relatedId: [
      { required: true, message: "关联业务id不能为空", trigger: "blur" }
    ],
    relatedNo: [
      { required: true, message: "关联业务编号不能为空", trigger: "blur" }
    ],
    totalAmount: [
      { required: true, message: "总金额不能为空", trigger: "blur" }
    ],
    discountAmount: [
      { required: true, message: "优惠金额不能为空", trigger: "blur" }
    ],
    actualAmount: [
      { required: true, message: "实际金额不能为空", trigger: "blur" }
    ],
    paidAmount: [
      { required: true, message: "支付金额不能为空", trigger: "blur" }
    ],
    balanceChange: [
      { required: true, message: "余额变动不能为空", trigger: "blur" }
    ],
    beforeBalance: [
      { required: true, message: "交易前余额不能为空", trigger: "blur" }
    ],
    afterBalance: [
      { required: true, message: "交易后余额不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询交易流水列表 */
function getList() {
  loading.value = true;
  listTransHistory(queryParams.value).then(response => {
  transHistoryList.value = response.rows;
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
    merchantId: null,
    bankAccountId: null,
    transType: null,
    relatedId: null,
    relatedNo: null,
    totalAmount: null,
    discountAmount: null,
    actualAmount: null,
    paidAmount: null,
    balanceChange: null,
    beforeBalance: null,
    afterBalance: null,
    createBy: null,
    createTime: null
  };
  proxy.resetForm("transHistoryRef");
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
    title.value = "添加交易流水";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getTransHistory(_id).then(response => {
    form.value = response.data;
  open.value = true;
  title.value = "修改交易流水";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["transHistoryRef"].validate(valid => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id != null) {
        updateTransHistory(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        }).finally(() => {
          buttonLoading.value = false;
        });
      } else {
        addTransHistory(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除交易流水编号为"' + _ids + '"的数据项？').then(function() {
    loading.value = true;
    return delTransHistory(_ids);
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
  proxy.download('financial/transHistory/export', {
    ...queryParams.value
  }, `transHistory_${new Date().getTime()}.xlsx`)
}

getList();
</script>
