<template>
  <div>
    <div class="receipt-refund-edit-wrapper app-container" style="margin-bottom: 60px" v-loading="loading">
      <el-card header="采购退货单基本信息">
        <el-form label-width="108px" :model="form" ref="purchaseRefundForm" :rules="rules">
          <el-row :gutter="24">
            <el-col :span="6">
              <el-row>
                <el-col :span="24">
                  <el-form-item label="单据编号" prop="docNo">
                    <el-input class="w200" v-model="form.docNo" placeholder="单据编号" :disabled="form.id"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label="备注" prop="remark">
                    <el-input
                      v-model="form.remark"
                      placeholder="备注...100个字符以内"
                      rows="4"
                      maxlength="100"
                      type="textarea"
                      show-word-limit="show-word-limit"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="18">
              <el-row>
                <el-col :span="8">
                  <el-form-item label="供应商" prop="merchantId">
                    <el-select v-model="form.merchantId" placeholder="请选择供应商" clearable filterable style="width:100%" :disabled="true">
                      <el-option v-for="item in useBasicStore().supplierList" :key="item.id" :label="item.merchantName" :value="item.id"/>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="单据日期" prop="docDate" >
                    <el-date-picker clearable
                                    v-model="form.docDate"
                                    type="date"
                                    value-format="YYYY-MM-DD"
                                    style="width:100%"
                                    placeholder="请选择单据日期">
                    </el-date-picker>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="入库单编号" prop="tradeNo">
                    <el-input v-model="form.tradeNo" placeholder="请输入入库单编号" :disabled="true"/>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <el-form-item label="其他费用" prop="otherExpensesAmount">
                    <el-input-number :controls="false" style="width:100%;" :precision="2" v-model="form.otherExpensesAmount" placeholder="请输入其他费用" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="总金额" >
                    <el-input-number style="width:100%" v-model="form.totalFormAmount" :controls="false" :precision="2" :disabled="true"></el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="优惠金额" prop="discountAmount">
                    <el-input-number :controls="false" style="width:100%;" :precision="2" v-model="form.discountAmount" placeholder="请输入优惠金额" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <el-form-item label="实际金额" prop="actualAmount">
                    <div style="display: flex; align-items: center; width: 100%;">
                      <el-input-number
                        style="flex: 1;"
                        v-model="form.actualAmount"
                        :controls="false"
                        :precision="2"
                        :disabled="true"
                      />
                      <el-tooltip content="实际金额 = 退单金额 + 其他费用 - 优惠金额" placement="top">
                        <el-icon style="margin-left: 8px; cursor: pointer; color: #409EFF;">
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="本次收款" prop="bankAccountId">
                    <el-select v-model="form.bankAccountId" placeholder="请选择银行账户" clearable filterable style="width:50%">
                      <el-option v-for="item in useBasicStore().bankAccountList" :key="item.id" :label="item.accountName" :value="item.id"/>
                    </el-select>
                    <el-input-number :controls="false" style="width:50%;" :precision="2" v-model="form.paidAmount" placeholder="请输入支付金额" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="剩余收款">
                    <el-input-number style="width:100%" v-model="form.remainingReceipt" :controls="false" :precision="2" :disabled="true"></el-input-number>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <el-card header="退货明细" class="mt10">
        <div class="receipt-refund-content">
          <div class="flex-space-between mb8">
            <div>
              <span>审批模式：</span>
              <el-switch
                :before-change="goSaasTip"
                class="mr10 ml10"
                inline-prompt
                size="large"
                v-model="mode"
                :active-value="true"
                :inactive-value="false"
                active-text="开启"
                inactive-text="关闭"
              />
            </div>

            <el-button type="primary" plain="plain" size="default" @click="showAddItem" icon="Plus">添加商品</el-button>
          </div>
          <el-table :data="form.details" border empty-text="暂无退货明细" show-summary :summary-method="getSummaries">
            <el-table-column label="仓库" align="left">
              <template #default="{ row }">
                <div>{{ useBasicStore().warehouseMap.get(row.warehouseId)?.warehouseName }}</div>
              </template>
            </el-table-column>
            <el-table-column label="商品信息" prop="sku.goodsName">
              <template #default="{ row }">
                <div>{{
                    row.goods.goodsName + (row.goods.goodsNo ? ('(' + row.goods.goodsNo + ')') : '')
                  }}
                </div>
                <div v-if="row.goods.brandId">
                  品牌：{{ useBasicStore().brandMap.get(row.goods.brandId).brandName }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="规格信息">
              <template #default="{ row }">
                <div>{{ row.sku.skuName }}</div>
                <div v-if="row.sku.barcode">条码：{{row.sku.barcode}}</div>
              </template>
            </el-table-column>
            <el-table-column label="数量" prop="qty" width="180" align="right">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.qty"
                  placeholder="数量"
                  @change="handleChangeQty(scope.row)"
                  :controls="false"
                  :min="1"
                  :precision="0"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="单价" prop="priceWithTax" width="180" align="right">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.priceWithTax"
                  @change="handleChangePrice(scope.row)"
                  placeholder="单价"
                  :precision="2"
                  :controls="false"
                  :min="0"
                  :max="2147483647"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="合计金额" prop="totalAmount" width="180" align="right">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.totalAmount"
                  :controls="false"
                  placeholder="合计金额"
                  :precision="2"
                  :min="0"
                  :max="2147483647"
                  @change="handleChangeTotalAmount(scope.row)"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="right" fixed="right">
              <template #default="scope">
                <el-button icon="Delete" type="danger" plain size="small"
                           @click="handleDeleteDetail(scope.row, scope.$index)" link>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
      <InventorySelect
        ref="inventorySelectRef"
        :model-value="inventorySelectShow"
        @handleOkClick="handleOkClick"
        @handleCancelClick="inventorySelectShow = false"
        :size="'90%'"
        :select-warehouse-disable="false"
        :warehouse-id="form.warehouseId"
        :selected-inventory="selectedInventory"
      />
    </div>
    <div class="footer-global">
      <div class="btn-box">
        <div>
          <el-button @click="doFinishEdit" type="primary" class="ml10">完成审核</el-button>
        </div>
        <div>
          <el-button @click="save" type="primary">暂存</el-button>
          <el-button @click="cancel" class="mr10">取消</el-button>
        </div>
      </div>
    </div>
  </div>
  <el-dialog v-model="batchSetWarehouseVisible" title="批量设置仓库" width="400" append-to-body>
    <el-select v-model="batchSetWarehouseId" placeholder="请选择仓库"
               filterable>
      <el-option v-for="item in useBasicStore().warehouseList" :key="item.id" :label="item.warehouseName"
                 :value="item.id"/>
    </el-select>
    <template #footer>
      <el-button @click="batchSetWarehouseVisible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirmSetWarehouse">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref,toRefs, watch} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import InventorySelect from "../../components/InventorySelect.vue"
import {useRoute} from "vue-router";
import {useBasicStore} from '@/store/modules/basic'
import {numSub, generateNo, parseTime} from '@/utils/ruoyi'
import { delRefundDetail } from '@/api/purchase/refundDetail'
import {addRefund, updateRefund, getRefund, passPurchaseRefund} from "@/api/purchase/refund";
import {listByTradeId} from "@/api/purchase/tradeDetail";
import {getSummaries, getWarehouseAndSkuKey} from "@/utils/wmsUtil";

const {proxy} = getCurrentInstance();
const mode = ref(false)
const loading = ref(false)
const batchSetWarehouseVisible = ref(false)
const batchSetWarehouseId = ref(null)
const inventorySelectRef = ref(null)
const selectedInventory = ref([])
const inventorySelectShow = ref(false)
const initFormData = {
  id: undefined,
  docNo: undefined,
  merchantId: undefined,
  goodsAmount: undefined,
  refundStatus: 0,
  remark: undefined,
  warehouseId: undefined,
  bankAccountId: undefined,
  prepayAmount: undefined,
  goodsQty: 0,
  tradeNo: undefined,
  details: [],
  remainingReceipt :undefined
}
const validateBankAccount = (rule, value, callback) => {
  if (form.value.paidAmount && !value) {
    callback(new Error("请选择银行账户"));
  }
  if (!form.value.paidAmount && value) {
    callback(new Error("请在右侧输入框输入收款金额"));
  }
  callback();
};
const data = reactive({
  form: {...initFormData},
  rules: {
    docNo: [
      {required: true, message: "退货单编号不能为空", trigger: "blur"}
    ],
    merchantId: [
      {required: true, message: "供应商不能为空", trigger: "blur"}
    ],
    bankAccountId: [{ validator: validateBankAccount, trigger: ['blur', 'change'] }]
  }
});
const { form, rules} = toRefs(data);


// 计算退单总数量
const goodsQty = computed(() => {
  return form.value.details.reduce((sum, row) => sum + (row.qty || 0), 0);
});

// 计算退单总数量
const goodsAmount = computed(() => {
  return form.value.details.reduce((sum, row) => sum + (row.totalAmount || 0), 0);
});

// 计算退单实际金额
const actualAmount = computed(() =>
  (Number(goodsAmount.value) || 0) +
  (Number(form.value?.otherExpensesAmount) || 0) -
  (Number(form.value?.discountAmount) || 0)
);
//计算总金额 等于 商品金额加其他费用
const totalFormAmount = computed(() => {
  return  (Number(goodsAmount.value) || 0) +
    (Number(form.value?.otherExpensesAmount) || 0);
});
//计算剩余收款 等于 实际金额 - 本次收款
const remainingReceipt = computed(() => {
  return actualAmount.value - (form.value?.paidAmount || 0);
});

// 监听 goodsAmount 变化，自动更新 form.goodsAmount
watch(goodsAmount, (newVal) => {
  form.value.goodsAmount = newVal;
});

// 监听 goodsQty 变化，自动更新 form.goodsQty
watch(goodsQty, (newVal) => {
  form.value.goodsQty = newVal;
});

//监听 actualAmount 变化，自动更新 form.actualAmount
watch(actualAmount, (newVal) => {
  form.value.actualAmount = newVal;
});
// 监听 totalFormAmount 变化，自动更新 form.totalFormAmount
watch(totalFormAmount, (newVal) => {
  form.value.totalFormAmount = newVal;
});

//监听remainingReceipt的变化
watch(remainingReceipt, (newVal) => {
  form.value.remainingReceipt = newVal;
});
const cancel = async () => {
  await proxy?.$modal.confirm('确认取消编辑采购退货单吗？');
  close()
}
const close = () => {
  const obj = {path: "/purchase/refund"};
  proxy?.$tab.closeOpenPage(obj);
}
const skuSelectShow = ref(false)

const setWarehouseDialogVisible = () => {
  if(form.value.details?.length == 0){
    ElMessage.error("请先添加退单！");
  }else {
    batchSetWarehouseVisible.value = true;
  }
}
const handleConfirmSetWarehouse = () => {
  if (!batchSetWarehouseId.value) {
    ElMessage.error("请选择仓库后再确定");
    return;
  }
  form.value.details.forEach(item => {
    if (item && typeof item === "object") {
      item.warehouseId = batchSetWarehouseId.value;
    }
  });
  batchSetWarehouseVisible.value =false;
  // 提示操作成功
  ElMessage.success("仓库批量设置成功");
}

// 选择商品 start
const showAddItem = () => {
  inventorySelectRef.value.getListByPurchaseTradeId(form.value.tradeId)
  inventorySelectShow.value = true
}
// 选择成功
const handleOkClick = (item) => {
  inventorySelectShow.value = false
  selectedInventory.value = [...item]
  item.forEach(it => {
    if (!form.value.details.find(detail => getWarehouseAndSkuKey(detail) === getWarehouseAndSkuKey(it))) {
      form.value.details.push(
        {
          ...it,
          id: null,
          priceWithTax:it.sku?.costPrice
        })
    }
  })
}
// 选择退单 end

// 初始化receipt-refund-form ref
const purchaseRefundForm = ref()

const save = async () => {
  proxy.$refs["purchaseRefundForm"].validate(valid => {
    if (valid) {
      doSave()
    }
  })

}

const handleChangeTotalAmount = (row) => {
  if(row.qty>0 && row.priceWithTax){
    row.priceWithTax = parseFloat((row.totalAmount / row.qty).toFixed(2));
  }
}

const handleChangePrice = (row) => {
  if(row.qty && row.priceWithTax){
    row.totalAmount = parseFloat((row.qty * row.priceWithTax).toFixed(2));
  }
}

const handleChangeQty = (row) => {
  if(row.qty && row.priceWithTax){
    row.totalAmount = parseFloat((row.qty * row.priceWithTax).toFixed(2));
  }
}

const getParamsBeforeSave = (refundStatus) => {
  let details = []
  if (form.value.details?.length) {
    details = form.value.details.map(it => {
      return {
        ...it
      }
    })
  }

  form.goodsQty = goodsQty

  return {
    ...form.value,
    refundStatus,
    details: details
  }
}

const doSave = async (refundStatus = 0) => {
  //验证purchaseRefundForm表单
  purchaseRefundForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }
    const params = getParamsBeforeSave(refundStatus)
    loading.value = true
    if (params.id) {
      updateRefund(params).then((res) => {
        if (res.code === 200) {
          ElMessage.success(res.msg)
          close()
        } else {
          ElMessage.error(res.msg)
        }
      }).finally(() => {
        loading.value = false
      })
    } else {
      addRefund(params).then((res) => {
        if (res.code === 200) {
          ElMessage.success(res.msg)
          close()
        } else {
          ElMessage.error(res.msg)
        }
      }).finally(() => {
        loading.value = false
      })
    }
  })
}

const doFinishEdit = async () => {
  purchaseRefundForm.value?.validate(async (valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }

    if (!form.value.details?.length) {
      return ElMessage.error('请选择退单')
    }
    if (form.value.details?.length) {
      const invalidQtyList = form.value.details.filter(it => !it.qty)
      const invalidTotalAmountList = form.value.details.filter(it => !it.totalAmount)
      if (invalidQtyList?.length) {
        return ElMessage.error('请设置退单明细中退单数量')
      }
      if (invalidTotalAmountList?.length) {
        return ElMessage.error('请设置退单明细中的合计金额')
      }
    }

    // 弹出确认框
    try {
      await proxy?.$modal.confirm('完成编辑后退款单将不可再次编辑，如设置了预付金额，将从账户扣除!');
    } catch (error) {
      // 用户取消操作
      return;
    }

    const params = getParamsBeforeSave(1);
    loading.value = true
    passPurchaseRefund(params).then((res) => {
      if (res.code === 200) {
        ElMessage.success('操作成功')
        close()
      } else {
        ElMessage.error(res.msg)
      }
    }).finally(() => {
      loading.value = false
    })
  })
}

const route = useRoute();
onMounted(() => {
  form.value.docDate = parseTime(new Date(), "{y}-{m}-{d}")
  const id = route.query && route.query.id;
  const tradeNo = route.query && route.query.tradeNo;
  const tradeId = route.query && route.query.tradeId;
  const merchantId = route.query && route.query.merchantId;

  if (id) {
    loadDetail(id)
  } else {
    form.value.docNo = 'PO' + generateNo()
  }
  if(tradeNo){
    form.value.tradeNo = tradeNo
  }
  if(tradeId){
    loading.value = true
    form.value.tradeId = tradeId
    listByTradeId(tradeId).then((response) => {
      form.value.details = response.data
    }).finally(() => {
      loading.value = false
    })
  }
  if(merchantId){
    form.value.merchantId = merchantId
  }
})


// 获取入库单详情
const loadDetail = (id) => {
  loading.value = true
  getRefund(id).then((response) => {
    form.value = {...response.data}
    if (response.data.details?.length) {
      selectedInventory.value = response.data.details.map(it => {
        return {
          id: it.id,
          skuId: it.skuId,
          warehouseId: it.warehouseId
        }
      })
    }
    Promise.resolve();
  }).then(() => {
  }).finally(() => {
    loading.value = false
  })
}

const handleAutoCalc = () => {
  let sum = undefined
  form.value.details.forEach(it => {
    if (it.totalAmount >= 0) {
      if (!sum) {
        sum = 0
      }
      sum = numSub(sum, -Number(it.totalAmount))
    }
  })
  form.value.goodsAmount = sum
}

const handleDeleteDetail = (row, index) => {
  if (row.id) {
    proxy.$modal.confirm('确认删除本条退单明细吗？如确认会立即执行！').then(function () {
      loading.value = true
      return delRefundDetail(row.id);
    }).then(() => {
      form.value.details.splice(index, 1)
      proxy.$modal.msgSuccess("删除成功");
    }).finally(() => {
      loading.value = false
    });
  } else {
    form.value.details.splice(index, 1)
  }
  const indexOfSelected = selectedInventory.value.findIndex(it => row.sku.id=== it.id)
  selectedInventory.value.splice(indexOfSelected, 1)
}
const goSaasTip = () => {
  ElMessageBox.alert('审批模式请去Saas版本体验！', '系统提示', {
    confirmButtonText: '确定'
  })
  return false
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.module";

:deep(.el-input-number .el-input__inner){
  text-align: right;
  line-height: 1;
  -webkit-appearance: none;
  -moz-appearance: textfield;
}

.btn-box {
  width: calc(100% - #{$base-sidebar-width});
  display: flex;
  align-items: center;
  justify-content: space-between;
  float: right;
}
</style>
