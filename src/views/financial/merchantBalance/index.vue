<template>
  <div class="app-container">

    <el-card class="mt20">

      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="6"><span style="font-size: large">商户余额</span></el-col>
      </el-row>

      <el-table v-loading="loading" :data="merchantBalanceList" border class="mt20">
            <el-table-column label="往来单位" prop="merchantId" >
              <template #default="{ row }">
                <div>{{ useBasicStore().merchantMap.get(row.merchantId)?.merchantName }}</div>
              </template>
            </el-table-column>
            <el-table-column label="初始余额" prop="initialBalance" />
        <el-table-column label="当前余额" prop="balance">
          <template #default="scope">
            <div v-if="scope.row.balance>0" :style="{ color: 'green' }">应付: {{ Math.abs(scope.row.balance)}}</div>
            <div v-else-if="scope.row.balance<0" :style="{ color:'red' }">应收: {{ Math.abs(scope.row.balance)}}</div>
            <div v-else > {{ Math.abs(scope.row.balance)}}</div>
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
    <!-- 添加或修改商户余额对话框 -->
    <el-drawer :title="title" v-model="open" size="50%" append-to-body>
      <el-form ref="merchantBalanceRef" :model="form" :rules="rules" label-width="80px">
              <el-form-item label="商户id" prop="merchantId">
                <el-input v-model="form.merchantId" placeholder="请输入商户id" />
              </el-form-item>
              <el-form-item label="初始余额" prop="initialBalance">
                <el-input v-model="form.initialBalance" placeholder="请输入初始余额" />
              </el-form-item>
              <el-form-item label="当前余额" prop="balance">
                <el-input v-model="form.balance" placeholder="请输入当前余额" />
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

<script setup name="MerchantBalance">
  import { listMerchantBalance, getMerchantBalance, addMerchantBalance } from "@/api/financial/merchantBalance";
  import {useBasicStore} from "@/store/modules/basic";

const { proxy } = getCurrentInstance();

  const merchantBalanceList = ref([]);
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
    initialBalance: undefined,
    balance: undefined,
  },
  rules: {
    id: [
      { required: true, message: "不能为空", trigger: "blur" }
    ],
    merchantId: [
      { required: true, message: "商户id不能为空", trigger: "blur" }
    ],
    initialBalance: [
      { required: true, message: "初始余额不能为空", trigger: "blur" }
    ],
    balance: [
      { required: true, message: "当前余额不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询商户余额列表 */
function getList() {
  loading.value = true;
  listMerchantBalance(queryParams.value).then(response => {
  merchantBalanceList.value = response.rows;
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
    initialBalance: null,
    balance: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("merchantBalanceRef");
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
    title.value = "添加商户余额";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getMerchantBalance(_id).then(response => {
    form.value = response.data;
  open.value = true;
  title.value = "修改商户余额";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["merchantBalanceRef"].validate(valid => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id != null) {
        updateMerchantBalance(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        }).finally(() => {
          buttonLoading.value = false;
        });
      } else {
        addMerchantBalance(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除商户余额编号为"' + _ids + '"的数据项？').then(function() {
    loading.value = true;
    return delMerchantBalance(_ids);
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
  proxy.download('financial/merchantBalance/export', {
    ...queryParams.value
  }, `merchantBalance_${new Date().getTime()}.xlsx`)
}

getList();
</script>
