<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
        <el-form-item label="父id" prop="pid">
          <el-input
            v-model="queryParams.pid"
            placeholder="请输入父id"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="sku id" prop="skuId">
          <el-input
            v-model="queryParams.skuId"
            placeholder="请输入sku id"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="商品数量" prop="qty">
          <el-input
            v-model="queryParams.qty"
            placeholder="请输入商品数量"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="不含税价" prop="priceWithoutTax">
          <el-input
            v-model="queryParams.priceWithoutTax"
            placeholder="请输入不含税价"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="税费" prop="taxAmount">
          <el-input
            v-model="queryParams.taxAmount"
            placeholder="请输入税费"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="税率" prop="taxRate">
          <el-input
            v-model="queryParams.taxRate"
            placeholder="请输入税率"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="含税价" prop="priceWithTax">
          <el-input
            v-model="queryParams.priceWithTax"
            placeholder="请输入含税价"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="总金额" prop="totalAmount">
          <el-input
            v-model="queryParams.totalAmount"
            placeholder="请输入总金额"
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
        <el-col :span="6"><span style="font-size: large">采购入库单明细</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['purchase:tradeDetail:add']"
          >新增</el-button>
          <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['purchase:tradeDetail:export']"
          >导出</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="tradeDetailList" border class="mt20">
        <el-table-column label="" prop="id" v-if="true"/>
        <el-table-column label="父id" prop="pid" />
        <el-table-column label="sku id" prop="skuId" />
        <el-table-column label="商品数量" prop="qty" />
        <el-table-column label="不含税价" prop="priceWithoutTax" />
        <el-table-column label="税费" prop="taxAmount" />
        <el-table-column label="税率" prop="taxRate" />
        <el-table-column label="含税价" prop="priceWithTax" />
        <el-table-column label="总金额" prop="totalAmount" />
        <el-table-column label="备注" prop="remark" />
        <el-table-column label="操作" align="right" class-name="small-padding fixed-width">
            <template #default="scope">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['purchase:tradeDetail:edit']">修改</el-button>
                <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['purchase:tradeDetail:remove']">删除</el-button>
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
    <!-- 添加或修改采购入库单明细对话框 -->
    <el-drawer :title="title" v-model="open" size="50%" append-to-body>
      <el-form ref="tradeDetailRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="父id" prop="pid">
          <el-input v-model="form.pid" placeholder="请输入父id" />
        </el-form-item>
        <el-form-item label="sku id" prop="skuId">
          <el-input v-model="form.skuId" placeholder="请输入sku id" />
        </el-form-item>
        <el-form-item label="商品数量" prop="qty">
          <el-input v-model="form.qty" placeholder="请输入商品数量" />
        </el-form-item>
        <el-form-item label="不含税价" prop="priceWithoutTax">
          <el-input v-model="form.priceWithoutTax" placeholder="请输入不含税价" />
        </el-form-item>
        <el-form-item label="税费" prop="taxAmount">
          <el-input v-model="form.taxAmount" placeholder="请输入税费" />
        </el-form-item>
        <el-form-item label="税率" prop="taxRate">
          <el-input v-model="form.taxRate" placeholder="请输入税率" />
        </el-form-item>
        <el-form-item label="含税价" prop="priceWithTax">
          <el-input v-model="form.priceWithTax" placeholder="请输入含税价" />
        </el-form-item>
        <el-form-item label="总金额" prop="totalAmount">
          <el-input v-model="form.totalAmount" placeholder="请输入总金额" />
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

<script setup name="TradeDetail">
import { listTradeDetail, getTradeDetail, delTradeDetail, addTradeDetail, updateTradeDetail } from "@/api/purchase/tradeDetail";

const { proxy } = getCurrentInstance();

const tradeDetailList = ref([]);
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
    pid: undefined,
    skuId: undefined,
    qty: undefined,
    priceWithoutTax: undefined,
    taxAmount: undefined,
    taxRate: undefined,
    priceWithTax: undefined,
    totalAmount: undefined,
  },
  rules: {
    id: [
      { required: true, message: "不能为空", trigger: "blur" }
    ],
    pid: [
      { required: true, message: "父id不能为空", trigger: "blur" }
    ],
    skuId: [
      { required: true, message: "sku id不能为空", trigger: "blur" }
    ],
    qty: [
      { required: true, message: "商品数量不能为空", trigger: "blur" }
    ],
    priceWithoutTax: [
      { required: true, message: "不含税价不能为空", trigger: "blur" }
    ],
    taxAmount: [
      { required: true, message: "税费不能为空", trigger: "blur" }
    ],
    taxRate: [
      { required: true, message: "税率不能为空", trigger: "blur" }
    ],
    priceWithTax: [
      { required: true, message: "含税价不能为空", trigger: "blur" }
    ],
    totalAmount: [
      { required: true, message: "总金额不能为空", trigger: "blur" }
    ],
    remark: [
      { required: true, message: "备注不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询采购入库单明细列表 */
function getList() {
  loading.value = true;
  listTradeDetail(queryParams.value).then(response => {
    tradeDetailList.value = response.rows;
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
    pid: null,
    skuId: null,
    qty: null,
    priceWithoutTax: null,
    taxAmount: null,
    taxRate: null,
    priceWithTax: null,
    totalAmount: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("tradeDetailRef");
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
  title.value = "添加采购入库单明细";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getTradeDetail(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改采购入库单明细";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["tradeDetailRef"].validate(valid => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id != null) {
        updateTradeDetail(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        }).finally(() => {
          buttonLoading.value = false;
        });
      } else {
        addTradeDetail(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除采购入库单明细编号为"' + _ids + '"的数据项？').then(function() {
    loading.value = true;
    return delTradeDetail(_ids);
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
  proxy.download('purchase/tradeDetail/export', {
    ...queryParams.value
  }, `tradeDetail_${new Date().getTime()}.xlsx`)
}

getList();
</script>
