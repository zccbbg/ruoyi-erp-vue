<template>
  <div>
    <div class="receipt-order-edit-wrapper app-container" style="margin-bottom: 60px" v-loading="loading">
      <el-card header="出库单基本信息">
        <el-form label-width="108px" :model="form" ref="shipmentForm" :rules="rules">
          <el-row :gutter="24">
            <el-col :span="11">
              <el-form-item label="出库单号" prop="docNo">
                <el-input class="w200" v-model="form.docNo" placeholder="出库单号"
                          :disabled="form.id"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="总数量" prop="goodsQty">
                <el-input-number style="width: 100%" v-model="form.goodsQty" :controls="false" :precision="0"
                                 :disabled="true"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="11">
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
            <el-col :span="6">
              <div style="display: flex;align-items: start">
                <el-form-item label="总金额" prop="goodsAmount">
                  <el-input-number style="width: 100%;" v-model="form.goodsAmount" :precision="2" :min="0"></el-input-number>
                </el-form-item>
                <el-button link type="primary" @click="handleAutoCalc" style="line-height: 32px">自动计算
                </el-button>
              </div>
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
                :active-value="true"
                :inactive-value="false"
                active-text="开启"
                inactive-text="关闭"
              />
            </div>
            <el-popover
              placement="left"
              title="提示"
              :width="200"
              trigger="hover"
              :disabled="form.warehouseId"
              content="请先选择仓库！"
            >
              <template #reference>
                <el-button type="primary" plain="plain" size="default" @click="showAddItem" icon="Plus">添加商品
                </el-button>
              </template>
            </el-popover>
          </div>
          <el-table :data="form.details" border empty-text="暂无商品明细">
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
            <el-table-column label="出库数量" prop="qty" width="180">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.qty"
                  placeholder="出库数量"
                  :min="1"
                  :precision="0"
                  @change="handleChangeQty"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="金额" prop="totalAmount" width="180">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.totalAmount"
                  placeholder="金额"
                  :precision="2"
                  :min="0"
                  :max="2147483647"
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
          <el-button @click="doShipment" type="primary" class="ml10">完成出库</el-button>
        </div>
        <div>
          <el-button @click="save" type="primary">暂存</el-button>
          <el-button @click="cancel" class="mr10">取消</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="ShipmentDocEdit">
import {computed, getCurrentInstance, onMounted, reactive, ref, toRef, toRefs, watch} from "vue";
import {addShipmentOrder, getShipmentOrder, updateShipmentOrder, outbound} from "@/api/wms/shipmentDoc";
import {delShipmentOrderDetail} from "@/api/wms/shipmentDocDetail";
import {ElMessage, ElMessageBox} from "element-plus";
import {useRoute} from "vue-router";
import {useBasicStore} from '@/store/modules/basic'
import {numSub, generateNo} from '@/utils/ruoyi'
import InventorySelect from "@/views/components/InventorySelect.vue";
import {getWarehouseAndSkuKey} from "@/utils/wmsUtil"

const {proxy} = getCurrentInstance();
const {wms_shipment_type} = proxy.useDict("wms_shipment_type");

const loading = ref(false)
const initFormData = {
  id: undefined,
  docNo: undefined,
  goodsAmount: undefined,
  checkedStatus: 0,
  remark: undefined,
  warehouseId: undefined,
  goodsQty: 0,
  details: [],
}
const inventorySelectRef = ref(null)
const selectedInventory = ref([])
const data = reactive({
  form: {...initFormData},
  rules: {
    docNo: [
      {required: true, message: "出库单号不能为空", trigger: "blur"}
    ],
    warehouseId: [
      {required: true, message: "请选择仓库", trigger: ['blur', 'change']}
    ],
  }
});
const {form, rules} = toRefs(data);
const cancel = async () => {
  await proxy?.$modal.confirm('确认取消编辑出库单吗？');
  close()
}
const close = () => {
  const obj = {path: "/wms/shipment"};
  proxy?.$tab.closeOpenPage(obj);
}
const inventorySelectShow = ref(false)

// 选择商品 start
const showAddItem = () => {
  inventorySelectRef.value.getList()
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
          sku: it.sku,
          goods: it.goods,
          skuId: it.skuId,
          totalAmount: undefined,
          qty: undefined,
          warehouseId: it.warehouseId,
          inventoryId: it.id,
        })
    }
  })
}
// 选择商品 end

// 初始化receipt-order-form ref
const shipmentForm = ref()

const save = async () => {
  await proxy?.$modal.confirm('确认暂存出库单吗？');
  doSave()
}

const getParamsBeforeSave = (checkedStatus) => {
  let details = []
  if (form.value.details?.length) {
    // 构建参数
    details = form.value.details.map(it => {
      return {
        id: it.id,
        receiptDocId: form.value.id,
        skuId: it.skuId,
        totalAmount: it.totalAmount,
        qty: it.qty,
        warehouseId: it.warehouseId
      }
    })
  }

  return {
    id: form.value.id,
    docNo: form.value.docNo,
    checkedStatus,
    remark: form.value.remark,
    goodsAmount: form.value.goodsAmount,
    goodsQty: form.value.goodsQty,
    details: details
  }
}

const doSave = (checkedStatus = 0) => {
  //验证shipmentForm表单
  shipmentForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }

    //('提交前校验',form.value)
    const params = getParamsBeforeSave(checkedStatus)

    loading.value = true
    if (params.id) {
      updateShipmentOrder(params).then((res) => {
        if (res.code === 200) {
          ElMessage.success(res.msg)
          close()
        } else {
          ElMessage.error(res.msg)
        }
      }).finally(()=>{
        loading.value = false
      })
    } else {
      addShipmentOrder(params).then((res) => {
        if (res.code === 200) {
          ElMessage.success(res.msg)
          close()
        } else {
          ElMessage.error(res.msg)
        }
      }).finally(()=>{
        loading.value = false
      })
    }
  })
}

const doShipment = async () => {
  await proxy?.$modal.confirm('确认出库吗？');
  shipmentForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }
    if (!form.value.details?.length) {
      return ElMessage.error('请选择商品')
    }
    const invalidQtyList = form.value.details.filter(it => !it.qty)
    if (invalidQtyList?.length) {
      return ElMessage.error('请选择数量')
    }
    const params = getParamsBeforeSave(1)

    loading.value = true
    outbound(params).then((res) => {
      if (res.code === 200) {
        ElMessage.success('出库成功')
        close()
      } else {
        ElMessage.error(res.msg)
      }
    }).finally(()=>{
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
    form.value.docNo = 'CK' + generateNo()
  }
})


// 获取入库单详情
const loadDetail = (id) => {
  loading.value = true
  getShipmentOrder(id).then((response) => {
    if (response.data.details?.length) {
      selectedInventory.value = response.data.details.map(it => {
        return {
          id: it.id,
          skuId: it.skuId,
          warehouseId: it.warehouseId
        }
      })
    }
    form.value = {...response.data}
    inventorySelectRef.value.setWarehouseId(form.value.warehouseId)
    Promise.resolve();
  }).then(() => {
  }).finally(() => {
    loading.value = false
  })
}

const handleChangeWarehouse = (e) => {
  form.value.details = []
  inventorySelectRef.value.setWarehouseId(form.value.warehouseId)
}

const handleChangeQty = () => {
  let sum = 0
  form.value.details.forEach(it => {
    if (it.qty) {
      sum += Number(it.qty)
    }
  })
  form.value.goodsQty = sum
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
      loading.value = true;
      return delShipmentOrderDetail(row.id);
    }).then(() => {
      form.value.details.splice(index, 1)
      proxy.$modal.msgSuccess("删除成功");
    }).finally(()=>{
      loading.value=false
    })
  } else {
    form.value.details.splice(index, 1)
  }
  const indexOfSelected = selectedInventory.value.findIndex(it => getWarehouseAndSkuKey(it) === getWarehouseAndSkuKey(row))
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

.btn-box {
  width: calc(100% - #{$base-sidebar-width});
  display: flex;
  align-items: center;
  justify-content: space-between;
  float: right;
}

.el-statistic__content {
  font-size: 14px;
}
</style>
