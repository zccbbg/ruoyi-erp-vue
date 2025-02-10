<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
              <el-form-item label="单据编号" prop="billNo">
                <el-input
                  v-model="queryParams.billNo"
                  placeholder="请输入单据编号"
                  clearable
                  @keyup.enter="handleQuery"
                />
              </el-form-item>
              <el-form-item label="单据日期" style="width: 308px">
                <el-date-picker
                  v-model="daterangeBillDate"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  type="daterange"
                  range-separator="-"
                  start-placeholder="开始日期"
                  :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="交货日期" style="width: 308px">
                <el-date-picker
                  v-model="daterangeDeliveryDate"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  type="daterange"
                  range-separator="-"
                  start-placeholder="开始日期"
                  :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="审核状态" prop="checkedStatus">
                <el-select v-model="queryParams.checkedStatus" placeholder="请选择审核状态" clearable>
                  <el-option
                    v-for="dict in doc_checked_status"
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
        <el-col :span="6"><span style="font-size: large">采购订单</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['purchase:order:all']"
          >新增</el-button>
<!--          <el-button-->
<!--            type="warning"-->
<!--            plain-->
<!--            icon="Download"-->
<!--            @click="handleExport"-->
<!--            v-hasPermi="['purchase:order:all']"-->
<!--          >导出</el-button>-->
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="orderList" border class="mt20">
            <el-table-column label="" prop="id" v-if="false"/>
            <el-table-column label="单据编号" prop="billNo" min-width="120"/>
            <el-table-column label="单据日期/交货日期" prop="billDate" width="160">
              <template #default="scope">
                <div v-if="scope.row.billDate">单据：{{ parseTime(scope.row.billDate, '{y}-{m}-{d}') }}</div>
                <div v-if="scope.row.deliveryDate">交货：{{ parseTime(scope.row.deliveryDate, '{y}-{m}-{d}') }}</div>
              </template>
            </el-table-column>
            <el-table-column label="供应商" prop="merchantId" min-width="120">
              <template #default="{ row }">
                <div>{{ useBasicStore().merchantMap.get(row.merchantId)?.merchantName }}</div>
              </template>
            </el-table-column>
            <el-table-column label="审核状态" prop="checkedStatus">
              <template #default="scope">
                  <dict-tag :options="doc_checked_status" :value="scope.row.checkedStatus"/>
              </template>
            </el-table-column>
            <el-table-column label="订单状态" prop="stockStatus" />

            <el-table-column label="商品数量" prop="goodsQty" />
            <el-table-column label="商品金额" prop="goodsAmount" />
            <el-table-column label="其他费用" prop="otherExpensesAmount" />
            <el-table-column label="优惠金额" prop="discountAmount" />
            <el-table-column label="实际金额" prop="actualAmount" />
            <el-table-column label="预付金额" prop="prepayAmount" />
        <el-table-column label="操作" align="right" class-name="small-padding fixed-width" width="120">
          <template #default="scope">
            <div>
              <el-button link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['purchase:order:all']">修改</el-button>
              <el-button link type="primary"  v-hasPermi="['purchase:order:all']">查看</el-button>
            </div>
            <div>
              <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['purchase:order:all']">删除</el-button>
              <el-button link type="primary" @click="alert('打印功能暂未开发！')" v-hasPermi="['wms:check:all']">打印</el-button>
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
    <!-- 添加或修改采购订单对话框 -->
    <el-drawer :title="title" v-model="open" size="50%" append-to-body>
      <el-form ref="orderRef" :model="form" :rules="rules" label-width="80px">
              <el-form-item label="单据编号" prop="billNo">
                <el-input v-model="form.billNo" placeholder="请输入单据编号" />
              </el-form-item>
              <el-form-item label="单据日期" prop="billDate">
                <el-date-picker clearable
                                v-model="form.billDate"
                                type="datetime"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                placeholder="请选择单据日期">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="交货日期" prop="deliveryDate">
                <el-date-picker clearable
                                v-model="form.deliveryDate"
                                type="datetime"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                placeholder="请选择交货日期">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="审核状态" prop="checkedStatus">
                <el-radio-group v-model="form.checkedStatus">
                  <el-radio
                    v-for="dict in doc_checked_status"
                    :key="dict.value"
                    :label="parseInt(dict.value)"
                  >{{dict.label}}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="审核人" prop="checkedBy">
                <el-input v-model="form.checkedBy" placeholder="请输入审核人" />
              </el-form-item>
              <el-form-item label="供应商id" prop="merchantId">
                <el-input v-model="form.merchantId" placeholder="请输入供应商id" />
              </el-form-item>
              <el-form-item label="商品数量" prop="goodsQty">
                <el-input v-model="form.goodsQty" placeholder="请输入商品数量" />
              </el-form-item>
              <el-form-item label="已处理数量" prop="processedQty">
                <el-input v-model="form.processedQty" placeholder="请输入已处理数量" />
              </el-form-item>
              <el-form-item label="商品金额" prop="goodsAmount">
                <el-input v-model="form.goodsAmount" placeholder="请输入商品金额" />
              </el-form-item>
              <el-form-item label="其他费用" prop="otherExpensesAmount">
                <el-input v-model="form.otherExpensesAmount" placeholder="请输入其他费用" />
              </el-form-item>
              <el-form-item label="优惠金额" prop="discountAmount">
                <el-input v-model="form.discountAmount" placeholder="请输入优惠金额" />
              </el-form-item>
              <el-form-item label="实际金额" prop="actualAmount">
                <el-input v-model="form.actualAmount" placeholder="请输入实际金额" />
              </el-form-item>
              <el-form-item label="预付金额" prop="prepayAmount">
                <el-input v-model="form.prepayAmount" placeholder="请输入预付金额" />
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

<script setup name="Order">
  import { listOrder, getOrder, delOrder, addOrder, updateOrder } from "@/api/purchase/order";
  import {useBasicStore} from "../../../store/modules/basic";

const { proxy } = getCurrentInstance();
    const { doc_checked_status } = proxy.useDict('doc_checked_status');

  const orderList = ref([]);
  const open = ref(false);
  const buttonLoading = ref(false);
  const loading = ref(true);
  const ids = ref([]);
  const total = ref(0);
  const title = ref("");
    const daterangeBillDate = ref([]);
    const daterangeDeliveryDate = ref([]);

  const data = reactive({
    form: {},
    queryParams: {
      pageNum: 1,
      pageSize: 10,
      billNo: undefined,
      billDate: undefined,
      deliveryDate: undefined,
      checkedStatus: undefined,
      stockStatus: undefined,
    },
  rules: {
    billNo: [
      { required: true, message: "单据编号不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询采购订单列表 */
function getList() {
  loading.value = true;
    queryParams.value.params = {};
  if (null != daterangeBillDate && '' != daterangeBillDate) {
    queryParams.value.params["beginBillDate"] = daterangeBillDate.value[0];
    queryParams.value.params["endBillDate"] = daterangeBillDate.value[1];
  }
  if (null != daterangeDeliveryDate && '' != daterangeDeliveryDate) {
    queryParams.value.params["beginDeliveryDate"] = daterangeDeliveryDate.value[0];
    queryParams.value.params["endDeliveryDate"] = daterangeDeliveryDate.value[1];
  }
  listOrder(queryParams.value).then(response => {
  orderList.value = response.rows;
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
    billNo: null,
    billDate: null,
    deliveryDate: null,
    checkedStatus: null,
    checkedBy: null,
    stockStatus: [],
    merchantId: null,
    goodsQty: null,
    processedQty: null,
    goodsAmount: null,
    otherExpensesAmount: null,
    discountAmount: null,
    actualAmount: null,
    prepayAmount: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("orderRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

    /** 重置按钮操作 */
    function resetQuery() {
      daterangeBillDate.value = [];
      daterangeDeliveryDate.value = [];
    proxy.resetForm("queryRef");
    handleQuery();
  }

  /** 新增按钮操作 */
  function handleAdd() {
    proxy.$router.push({ path: "/purchase/orderEdit" });
}

/** 修改按钮操作 */
function handleUpdate(row) {
  proxy.$router.push({ path: "/purchase/orderEdit",  query: { id: row.id } });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["orderRef"].validate(valid => {
    if (valid) {
      buttonLoading.value = true;
      form.value.stockStatus = form.value.stockStatus.join(",");
      if (form.value.id != null) {
        updateOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        }).finally(() => {
          buttonLoading.value = false;
        });
      } else {
        addOrder(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除采购订单编号为"' + _ids + '"的数据项？').then(function() {
    loading.value = true;
    return delOrder(_ids);
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
  proxy.download('purchase/order/export', {
    ...queryParams.value
  }, `order_${new Date().getTime()}.xlsx`)
}

getList();
</script>
