<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
        <el-form-item label="往来单位" prop="merchantId">
          <el-select v-model="queryParams.merchantId" placeholder="请选择供应商" clearable filterable style="width:100%">
            <el-option v-for="item in useBasicStore().merchantList" :key="item.id" :label="item.merchantName" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="交易账户" prop="bankAccountId">
          <el-select v-model="queryParams.bankAccountId" placeholder="请选择交易账户" clearable filterable style="width:100%">
            <el-option v-for="item in useBasicStore().bankAccountList" :key="item.id" :label="item.accountName" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="交易类型" prop="transType">
          <el-select v-model="queryParams.transType" placeholder="请选择交易类型" clearable filterable style="width:100%">
            <el-option
              v-for="item in transTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="业务编号" prop="relatedNo">
          <el-input
            v-model="queryParams.relatedNo"
            placeholder="请输入关联业务编号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="操作时间" prop="createTimeRange">
          <el-date-picker
            v-model="createTimeRange"
            type="datetimerange"
            range-separator="至"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
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
      </el-row>

      <el-table v-loading="loading" :data="transHistoryList" border class="mt20">
            <el-table-column label="往来单位" prop="merchantId">
              <template #default="{ row }">
                <div>{{ useBasicStore().merchantMap.get(row.merchantId)?.merchantName }}</div>
              </template>
            </el-table-column>
            <el-table-column label="交易类型" prop="transType" />
        <el-table-column label="关联业务编号/操作时间">
          <template #default="{ row }">
            <a @click="handleRelatedNoClick(row.relatedNo,row.transType)" style="color: #409EFF;">{{ row.relatedNo }}</a>
            <div>{{ (row.createTime) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="交易账户详情" align="center">
          <el-table-column label="交易账户" prop="bankAccountId" align="center" width="110">
            <template #default="{ row }">
              <div>
                {{ useBasicStore().bankAccountMap.get(row.bankAccountId)?.accountName || '--' }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="金额变动" prop="paidAmount" align="right" width="110" :formatter="formatNumber">
            <template #default="scope">
              {{ scope.row.paidAmount ?? '--' }}
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="交易金额" align="center">
          <el-table-column label="总金额" align="right" width="110">
            <template #default="scope">
              {{ scope.row.totalAmount ?? '--' }}
            </template>
          </el-table-column>
          <el-table-column label="优惠金额" align="right" width="90">
            <template #default="scope">
              {{ scope.row.discountAmount ?? '--' }}
            </template>
          </el-table-column>
          <el-table-column label="实际金额" align="right" width="110">
            <template #default="scope">
              {{ scope.row.actualAmount ?? '--' }}
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="商户余额" align="center">
          <el-table-column label="交易前余额" prop="beforeBalance" align="right" width="150">
            <template #default="scope">
              <div v-if="scope.row.beforeBalance>0" :style="{ color: 'green' }">应付: {{ Math.abs(scope.row.beforeBalance)}}</div>
              <div v-if="scope.row.beforeBalance<0" :style="{ color:'red' }">应收: {{ Math.abs(scope.row.beforeBalance)}}</div>
            </template>
          </el-table-column>
          <el-table-column label="余额变动" prop="balanceChange" align="right" width="150">
            <template #default="scope">
              <div v-if="scope.row.balanceChange>0" :style="{ color: 'green' }">应付: {{ Math.abs(scope.row.balanceChange)}}</div>
              <div v-if="scope.row.balanceChange<0" :style="{ color:'red' }">应收: {{ Math.abs(scope.row.balanceChange)}}</div>
            </template>
          </el-table-column>
          <el-table-column label="交易后余额" prop="afterBalance" align="right" width="150">
            <template #default="scope">
              <div v-if="scope.row.afterBalance>0" :style="{ color: 'green' }">应付: {{ Math.abs(scope.row.afterBalance)}}</div>
              <div v-if="scope.row.afterBalance<0" :style="{ color:'red' }">应收: {{ Math.abs(scope.row.afterBalance)}}</div>
            </template>
          </el-table-column>
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
              <el-form-item label="交易账户id" prop="bankAccountId">
                <el-input v-model="form.bankAccountId" placeholder="请输入交易账户id" />
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
  import { listTransHistory, getTransHistory } from "@/api/financial/transHistory";
  import {useBasicStore} from "@/store/modules/basic";
  import {getCurrentInstance, reactive, ref, toRefs} from "vue";

const { proxy } = getCurrentInstance();
  const createTimeRange = ref([]);
  const transHistoryList = ref([]);
  const open = ref(false);
  const buttonLoading = ref(false);
  const loading = ref(true);
  const ids = ref([]);
  const total = ref(0);
  const title = ref("");
  const transTypeOptions = [
    { value: '采购订单', label: '采购订单' },
    { value: '采购入库', label: '采购入库' },
    { value: '采购退货', label: '采购退货' },
    { value: '销售订单', label: '销售订单' },
    { value: '销售出库', label: '销售出库' },
    { value: '销售退货', label: '销售退货' },
    { value: '收款单', label: '收款单' },
    { value: '付款单', label: '付款单' },
  ]
  const data = reactive({
    form: {},
    queryParams: {
      pageNum: 1,
      pageSize: 50,
      merchantId: undefined,
      bankAccountId: undefined,
      transType: undefined,
      relatedNo: undefined,
      params: undefined
  },
  rules: {
    id: [
      { required: true, message: "不能为空", trigger: "blur" }
    ],
    merchantId: [
      { required: true, message: "商家id不能为空", trigger: "blur" }
    ],
    bankAccountId: [
      { required: true, message: "交易账户id不能为空", trigger: "blur" }
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
  queryParams.value.params = {};
  if (null != createTimeRange && '' != createTimeRange) {
    queryParams.value.params["beginTransDate"] = createTimeRange.value[0];
    queryParams.value.params["endTransDate"] = createTimeRange.value[1];
  }
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
    createTime: null,
    createTimeRange:null
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
  createTimeRange.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
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
  // 定义路由映射表，使用对象字面量提高代码可读性
  const routingMap = {
    '采购入库': '/purchase/trade',
    '采购订单': '/purchase/order',
    '采购退货单': '/purchase/refund',
    '销售出库': '/sales/trade',
    '销售订单': '/sales/order',
    '销售退货单': '/sales/refund',
    '收款单': '/finalcial/receiptVoucher',
    '付款单': '/finalcial/paymentVoucher'
  };
function handleRelatedNoClick(relatedNo,transType) {
  const routingAddress = routingMap[transType];
  if(routingAddress){
    // 跳转到对应模块并传递相关参数
    proxy.$router.push({
      path: routingAddress, // 替换为实际的目标模块名称
      query: {relatedNo}
    });
  }
  }
getList();
</script>

