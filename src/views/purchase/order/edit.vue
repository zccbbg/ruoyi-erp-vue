<template>
  <div>
    <div class="receipt-order-edit-wrapper app-container" style="margin-bottom: 60px" v-loading="loading">
      <el-card header="采购订单基本信息">
        <el-form label-width="108px" :model="form" ref="purchaseOrderForm" :rules="rules">
          <el-row :gutter="24">
            <el-col :span="6">
              <el-row>
                <el-col :span="24">
                  <el-form-item label="订单编号" prop="docNo">
                    <el-input class="w200" v-model="form.docNo" placeholder="订单编号" :disabled="form.id"></el-input>
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
                  <el-form-item label="交货日期" prop="deliveryDate">
                    <el-date-picker clearable
                                    v-model="form.deliveryDate"
                                    type="date"
                                    style="width:100%"
                                    value-format="YYYY-MM-DD"
                                    placeholder="请选择交货日期">
                    </el-date-picker>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="供应商" prop="merchantId">
                    <el-select v-model="form.merchantId" placeholder="请选择供应商" clearable filterable style="width:100%">
                      <el-option v-for="item in useBasicStore().supplierList" :key="item.id" :label="item.merchantName" :value="item.id"/>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <el-form-item label="优惠金额" prop="discountAmount">
                    <el-input-number :controls="false" style="width:100%;" :precision="2" v-model="form.discountAmount" placeholder="请输入优惠金额" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="其他费用" prop="otherExpensesAmount">
                    <el-input-number :controls="false" style="width:100%;" :precision="2" v-model="form.otherExpensesAmount" placeholder="请输入其他费用" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="预付金额" prop="prepayAmount">
                    <el-input-number :controls="false" style="width:100%;" :precision="2" v-model="form.prepayAmount" placeholder="请输入预付金额" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <el-form-item label="商品数量" prop="goodsQty">
                    <el-input-number style="width:100%" v-model="form.goodsQty" :controls="false" :precision="0" :disabled="true"></el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="商品金额" prop="goodsAmount">
                    <el-input-number style="width:100%" v-model="form.goodsAmount" :controls="false" :precision="2" :disabled="true"></el-input-number>
                  </el-form-item>
                </el-col>
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
                      <el-tooltip content="实际金额 = 商品金额 + 其他费用 - 优惠金额" placement="top">
                        <el-icon style="margin-left: 8px; cursor: pointer; color: #409EFF;">
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <el-card header="商品明细" class="mt10">
        <div class="receipt-order-content">
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
          <el-table :data="form.details" border empty-text="暂无商品明细">
            <el-table-column label="商品信息" prop="sku.goodsName">
              <template #default="{ row }">
                <div>{{ row.goods.goodsName + (row.goods.itemCode ? ('(' + row.goods.itemCode + ')') : '') }}</div>
                <div v-if="row.goods.brandId">品牌：{{ useBasicStore().brandMap.get(row.goods.brandId).brandName }}</div>
              </template>
            </el-table-column>
            <el-table-column label="规格信息">
              <template #default="{ row }">
                <div>{{ row.sku.skuName }}</div>
                <div v-if="row.sku.barcode">条码：{{row.sku.barcode}}</div>
              </template>
            </el-table-column>
            <el-table-column>
              <template #header>
                <div style="display: flex; align-items: center;">
                  <div>仓库</div>
                  <el-button style="margin-left: 10px" @click="setWarehouseDialogVisible">批量</el-button>
                </div>
              </template>
              <template #default="scope">
                <el-select v-model="scope.row.warehouseId" placeholder="请选择仓库"
                           filterable>
                  <el-option v-for="item in useBasicStore().warehouseList" :key="item.id" :label="item.warehouseName"
                             :value="item.id"/>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="数量" prop="qty" width="180">
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
            <el-table-column label="单价" prop="priceWithTax" width="180">
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
            <el-table-column label="合计金额" prop="totalAmount" width="180">
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
                <el-button icon="Delete" type="danger" plain size="small" @click="handleDeleteDetail(scope.row, scope.$index)" link>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
      <SkuSelect
        ref="skuSelectRef"
        :model-value="skuSelectShow"
        :selected-sku="selectedSku"
        @handleOkClick="handleOkClick"
        @handleCancelClick="skuSelectShow = false"
        :size="'80%'"
      />
    </div>
    <div class="footer-global">
      <div class="btn-box">
        <div>
          <el-button @click="doWarehousing" type="primary" class="ml10">完成入库</el-button>
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
import {computed, getCurrentInstance, onMounted, reactive, ref, toRef, toRefs, watch} from "vue";
import {addOrder, getOrder, updateOrder} from "@/api/purchase/order";
import {ElMessage, ElMessageBox} from "element-plus";
import SkuSelect from "../../components/SkuSelect.vue";
import {useRoute} from "vue-router";
import {useBasicStore} from '@/store/modules/basic'
import { numSub, generateNo } from '@/utils/ruoyi'
import { delOrderDetail } from '@/api/purchase/orderDetail'
import {getWarehouseAndSkuKey} from "@/utils/wmsUtil";

const {proxy} = getCurrentInstance();
const selectedSku = ref([])
const mode = ref(false)
const loading = ref(false)
const batchSetWarehouseVisible = ref(false)
const skuSelectRef = ref(null)
const batchSetWarehouseId = ref(null)
const initFormData = {
  id: undefined,
  docNo: undefined,
  optType: "2",
  merchantId: undefined,
  goodsAmount: undefined,
  orderStatus: 0,
  remark: undefined,
  warehouseId: undefined,
  goodsQty: 0,
  details: [],
}
const data = reactive({
  form: {...initFormData},
  rules: {
    docNo: [
      {required: true, message: "订单编号不能为空", trigger: "blur"}
    ],
    warehouseId: [
      {required: true, message: "请选择仓库", trigger: ['blur', 'change']}
    ]
  }
});
const { form, rules} = toRefs(data);


// 计算商品总数量
const goodsQty = computed(() => {
  return form.value.details.reduce((sum, row) => sum + (row.qty || 0), 0);
});

// 计算商品总数量
const goodsAmount = computed(() => {
  return form.value.details.reduce((sum, row) => sum + (row.totalAmount || 0), 0);
});

// 计算商品实际金额
const actualAmount = computed(() =>
  (Number(goodsAmount.value) || 0) +
  (Number(form.value?.otherExpensesAmount) || 0) -
  (Number(form.value?.discountAmount) || 0)
);

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

const cancel = async () => {
  await proxy?.$modal.confirm('确认取消编辑采购订单吗？');
  close()
}
const close = () => {
  const obj = {path: "/purchase/order"};
  proxy?.$tab.closeOpenPage(obj);
}
const skuSelectShow = ref(false)

const setWarehouseDialogVisible = () => {
  if(form.value.details?.length == 0){
    ElMessage.error("请先添加商品！");
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
  skuSelectRef.value.getList()
  skuSelectShow.value = true
}
// 选择成功
const handleOkClick = (item) => {
  skuSelectShow.value = false
  selectedSku.value = [...item]
  item.forEach((it) => {
    if (!form.value.details.find(detail => detail.sku.id === it.id)) {
      form.value.details.push(
        {...it}
      )
    }
  })
}
// 选择商品 end

// 初始化receipt-order-form ref
const purchaseOrderForm = ref()

const save = async () => {
  await proxy?.$modal.confirm('确认暂存采购订单吗？');
  doSave()
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

const getParamsBeforeSave = (orderStatus) => {
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
    orderStatus,
    details: details
  }
}

const doSave = async (orderStatus = 0) => {
  //验证purchaseOrderForm表单
  purchaseOrderForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }
    const params = getParamsBeforeSave(orderStatus)
    loading.value = true
    if (params.id) {
      updateOrder(params).then((res) => {
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
      addOrder(params).then((res) => {
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

const doWarehousing = async () => {
  purchaseOrderForm.value?.validate(async (valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }

    if (!form.value.details?.length) {
      return ElMessage.error('请选择商品')
    }
    if (form.value.details?.length) {
      const invalidQtyList = form.value.details.filter(it => !it.qty)
      const invalidWarehouseList = form.value.details.filter(it => !it.warehouseId)
      if (invalidQtyList?.length) {
        return ElMessage.error('请设置商品明细中商品数量')
      }
      if (invalidWarehouseList?.length) {
        return ElMessage.error('请设置商品明细中商品仓库')
      }
    }

    // 弹出确认框
    try {
      await proxy?.$modal.confirm('确认入库吗？');
    } catch (error) {
      // 用户取消操作
      return;
    }

    const params = getParamsBeforeSave(1);
    loading.value = true
    inbound(params).then((res) => {
      if (res.code === 200) {
        ElMessage.success('入库成功')
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
  const id = route.query && route.query.id;
  if (id) {
    loadDetail(id)
  } else {
    form.value.docNo = 'PO' + generateNo()
  }
})


// 获取入库单详情
const loadDetail = (id) => {
  loading.value = true
  getOrder(id).then((response) => {
    form.value = {...response.data}
    if (response.data.details?.length) {
      selectedSku.value = response.data.details.map(it => {
        return {
          id: it.skuId
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
    proxy.$modal.confirm('确认删除本条商品明细吗？如确认会立即执行！').then(function () {
      loading.value = true
      return delOrderDetail(row.id);
    }).then(() => {
      form.value.details.splice(index, 1)
      proxy.$modal.msgSuccess("删除成功");
    }).finally(() => {
      loading.value = false
    });
  } else {
    form.value.details.splice(index, 1)
  }
  const indexOfSelected = selectedSku.value.findIndex(it => row.sku.id=== it.id)
  selectedSku.value.splice(indexOfSelected, 1)
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
  text-align: left;
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
