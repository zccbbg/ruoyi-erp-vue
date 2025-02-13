<template>
  <div class="app-container">
<!--    <el-card>-->
<!--      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">-->
<!--        <el-form-item>-->
<!--          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>-->
<!--            <el-button icon="Refresh" @click="resetQuery">重置</el-button>-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--    </el-card>-->

    <el-card class="mt20">

      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="6"><span style="font-size: large">银行账户</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['basic:bankAccount:add']"
          >新增</el-button>
<!--          <el-button-->
<!--            type="warning"-->
<!--            plain-->
<!--            icon="Download"-->
<!--            @click="handleExport"-->
<!--            v-hasPermi="['basic:bankAccount:export']"-->
<!--          >导出</el-button>-->
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="bankAccountList" border class="mt20">
            <el-table-column label="" prop="id" v-if="true"/>
            <el-table-column label="账户编号" prop="accountNo" />
            <el-table-column label="账户名称" prop="accountName" />
            <el-table-column label="备注" prop="remark" />
        <el-table-column label="操作" align="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['basic:bankAccount:edit']">修改</el-button>
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['basic:bankAccount:remove']">删除</el-button>
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
    <!-- 添加或修改银行账户对话框 -->
    <el-drawer :title="title" v-model="open" size="50%" append-to-body>
      <el-form ref="bankAccountRef" :model="form" :rules="rules" label-width="80px">
              <el-form-item label="账户编号" prop="accountNo">
                <el-input v-model="form.accountNo" placeholder="请输入账户编号" />
              </el-form-item>
              <el-form-item label="账户名称" prop="accountName">
                <el-input v-model="form.accountName" placeholder="请输入账户名称" />
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

<script setup name="BankAccount">
  import { listBankAccount, getBankAccount, delBankAccount, addBankAccount, updateBankAccount } from "@/api/basic/bankAccount";

const { proxy } = getCurrentInstance();

  const bankAccountList = ref([]);
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
  },
  rules: {
    id: [
      { required: true, message: "不能为空", trigger: "blur" }
    ],
    accountNo: [
      { required: true, message: "账户编号不能为空", trigger: "blur" }
    ],
    accountName: [
      { required: true, message: "账户名称不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询银行账户列表 */
function getList() {
  loading.value = true;
  listBankAccount(queryParams.value).then(response => {
  bankAccountList.value = response.rows;
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
    accountNo: null,
    accountName: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("bankAccountRef");
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
    title.value = "添加银行账户";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getBankAccount(_id).then(response => {
    form.value = response.data;
  open.value = true;
  title.value = "修改银行账户";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["bankAccountRef"].validate(valid => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id != null) {
        updateBankAccount(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        }).finally(() => {
          buttonLoading.value = false;
        });
      } else {
        addBankAccount(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除银行账户编号为"' + _ids + '"的数据项？').then(function() {
    loading.value = true;
    return delBankAccount(_ids);
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
  proxy.download('basic/bankAccount/export', {
    ...queryParams.value
  }, `bankAccount_${new Date().getTime()}.xlsx`)
}

getList();
</script>
