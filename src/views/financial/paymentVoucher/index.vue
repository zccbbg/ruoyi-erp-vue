<script setup name="paymentVoucher">
import {
  listPaymentVoucher,
  getPaymentVoucher,
  addPaymentVoucher,
  updatePaymentVoucher,
  delPaymentVoucher,
  finishPaymentVoucher
} from "@/api/financial/paymentVoucher";
import {useBasicStore} from "@/store/modules/basic";
import { numSub, generateNo } from '@/utils/ruoyi'
import {computed, onMounted, watch} from "vue";
import {useRoute} from "vue-router";
const { proxy } = getCurrentInstance();
const { finish_status } = proxy.useDict("finish_status");

const paymentVoucherList = ref([]);
const open = ref(false);
const saveBtnLoading = ref(false);
const finishBtnLoading = ref(false);
const loading = ref(true);
const ids = ref([]);
const total = ref(0);
const title = ref("");
const daterangeTransDate = ref([]);
const validateDiscount = (rule, value, callback) => {
  if (form.value.totalAmount !== null && value !== null && form.value.totalAmount < value) {
    callback(new Error('优惠金额不能大于总金额'));
  } else {
    callback();
  }
};

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
      { required: true, message: "付款日期不能为空", trigger: "blur" }
    ],
    merchantId: [
      { required: true, message: "往来单位id不能为空", trigger: "blur" }
    ],
    bankAccountId: [
      { required: true, message: "银行账户id不能为空", trigger: "blur" }
    ],
    paidAmount: [
      { required: true, message: "支付金额不能为空", trigger: "blur" }
    ],
    discountAmount: [ { validator: validateDiscount, trigger: 'blur' }],
    totalAmount: [
      { required: true, message: "总金额不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

const paidAmount = computed(() =>
  (Number(form.value?.totalAmount) || 0) -
  (Number(form.value?.discountAmount) || 0)
);

watch(paidAmount, (newVal) => {
  form.value.paidAmount = newVal;
});

/** 查询付款单列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeTransDate && '' != daterangeTransDate) {
    queryParams.value.params["beginTransDate"] = daterangeTransDate.value[0];
    queryParams.value.params["endTransDate"] = daterangeTransDate.value[1];
  }
  listPaymentVoucher(queryParams.value).then(response => {
    paymentVoucherList.value = response.rows;
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
  proxy.resetForm("paymentVoucherRef");
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
  title.value = "添加付款单";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getPaymentVoucher(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改付款单";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["paymentVoucherRef"].validate(valid => {
    if (valid) {
      saveBtnLoading.value = true;
      if (form.value.id != null) {
        updatePaymentVoucher(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        }).finally(() => {
          saveBtnLoading.value = false;
        });
      } else {
        addPaymentVoucher(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        }).finally(() => {
          saveBtnLoading.value = false;
        });
      }
    }
  });
}
function finishForm() {
  proxy.$refs["paymentVoucherRef"].validate(valid => {
    if (valid) {
      finishBtnLoading.value = true;
      finishPaymentVoucher(form.value).then(response => {
        proxy.$modal.msgSuccess("操作成功");
        open.value = false;
        getList();
      }).finally(() => {
        finishBtnLoading.value = false;
      });
    }
  });
}

function handlePrint(row){
  proxy.$modal.alert('打印功能暂未开发！')
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除付款单编号为"' + _ids + '"的数据项？').then(function() {
    loading.value = true;
    return delPaymentVoucher(_ids);
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
  proxy.download('financial/paymentVoucher/export', {
    ...queryParams.value
  }, `paymentVoucher_${new Date().getTime()}.xlsx`)
}

const route = useRoute();
onMounted(() => {
  const relatedNo = route.query && route.query.relatedNo;
  if (relatedNo) {
    queryParams.value.voucherNo = relatedNo;
  }
  getList();
})
</script>

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
        <el-form-item label="付款日期" style="width: 308px">
          <el-date-picker
            v-model="daterangeTransDate"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="往来单位" prop="merchantId">
          <el-select v-model="queryParams.merchantId" placeholder="请选择供应商" clearable filterable style="width:100%">
            <el-option v-for="item in useBasicStore().merchantList" :key="item.id" :label="item.merchantName" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="银行账户" prop="bankAccountId">
          <el-select v-model="queryParams.bankAccountId" placeholder="请选择银行账户" clearable filterable style="width:100%">
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
        <el-col :span="6"><span style="font-size: large">付款单</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['financial:paymentVoucher:add']"
          >新增</el-button>
                    <el-button
                      type="warning"
                      plain
                      icon="Download"
                      @click="handleExport"
                      v-hasPermi="['financial:paymentVoucher:export']"
                    >导出</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="paymentVoucherList" border class="mt20">
        <el-table-column label="编号" prop="voucherNo" />
        <el-table-column label="付款日期" prop="transDate" width="120">
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
        <el-table-column label="总金额" prop="totalAmount" align="right" width="120"/>
        <el-table-column label="优惠金额" prop="discountAmount" align="right" width="120"/>
        <el-table-column label="支付金额" prop="paidAmount" align="right" width="120"/>
        <el-table-column label="完成状态" prop="checkedStatus" width="80" align="center">
          <template #default="{ row }">
            <dict-tag :options="finish_status" :value="row.checkedStatus" />
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" />
        <el-table-column label="操作" align="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-popover
              placement="left"
              title="提示"
              :width="300"
              trigger="hover"
              :disabled="scope.row.checkedStatus === 0"
              :content="'付款单【' + scope.row.voucherNo + '】已完成，无法修改！' "
            >
              <template #reference>
                <el-button link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['financial:paymentVoucher:all']" :disabled="[1].includes(scope.row.checkedStatus)">修改</el-button>
              </template>
            </el-popover>
            <el-popover
              placement="left"
              title="提示"
              :width="300"
              trigger="hover"
              :disabled="scope.row.checkedStatus === 0"
              :content="'付款单【' + scope.row.voucherNo + '】已完成，无法删除！' "
            >
              <template #reference>
                <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['financial:paymentVoucher:all']" :disabled="[1].includes(scope.row.checkedStatus)">删除</el-button>
              </template>
            </el-popover>
            <el-button link type="primary" @click="handlePrint(scope.row)" v-hasPermi="['financial:paymentVoucher:all']">打印</el-button>
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
    <!-- 添加或修改付款单对话框 -->
    <el-drawer :title="title" v-model="open" size="50%" append-to-body>
      <el-form ref="paymentVoucherRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="编号" prop="voucherNo">
          <el-input v-model="form.voucherNo" placeholder="请输入编号" />
        </el-form-item>
        <el-form-item label="付款日期" prop="transDate">
          <el-date-picker clearable
                          v-model="form.transDate"
                          type="date"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择付款日期">
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
          <el-input-number :controls="false" style="width:100%;" :precision="2" v-model="form.totalAmount" placeholder="请输入总金额"/>
        </el-form-item>
        <el-form-item label="优惠金额" prop="discountAmount">
          <el-input-number :controls="false" style="width:100%;" :precision="2" v-model="form.discountAmount" placeholder="请输入优惠金额" />
        </el-form-item>
        <el-form-item label="支付金额" prop="paidAmount">
          <el-input-number :controls="false" style="width:100%;" :precision="2" v-model="form.paidAmount" placeholder="请输入支付金额" disabled="disabled" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <div class="btn-box">
            <div>
              <el-button :loading="finishBtnLoading" type="primary" @click="finishForm" class="ml10">完成付款</el-button>
            </div>
            <div>
              <el-button :loading="saveBtnLoading" type="primary" @click="submitForm">暂 存</el-button>
              <el-button @click="cancel">取 消</el-button>
            </div>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.btn-box {
  width: calc(100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
:deep(.el-input-number .el-input__inner){
  text-align: left;
  line-height: 1;
  -webkit-appearance: none;
  -moz-appearance: textfield;
}
</style>
