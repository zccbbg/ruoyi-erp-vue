<template>
  <div>
    <div class="receipt-order-edit-wrapper app-container" style="margin-bottom: 60px" v-loading="loading">
      <el-card header="调拨单基本信息">
        <el-form label-width="108px" :model="form" ref="movementForm" :rules="rules">
          <el-row :gutter="24">
            <el-col :span="11">
              <el-form-item label="调拨单号" prop="docNo">
                <el-input class="w200" v-model="form.docNo" placeholder="调拨单号"
                          :disabled="form.id"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="总数量" prop="goodsQty" >
                <el-input-number v-model="form.goodsQty" :controls="false" :precision="0"
                                 :disabled="true" style="width: 100%"></el-input-number>
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

            <el-button type="primary" plain="plain" size="default" @click="showAddItem" icon="Plus">添加商品
            </el-button>
          </div>
          <el-table :data="form.details" border empty-text="暂无商品明细">
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
                <div>{{ row.sku.skuName}}</div>
                <div v-if="row.sku.barcode">条码：{{ row.sku.barcode }}</div>
              </template>
            </el-table-column>
            <el-table-column label="源仓库" align="left">
              <template #default="{ row }">
                <div>{{ useBasicStore().warehouseMap.get(row.warehouseId)?.warehouseName }}</div>
              </template>
            </el-table-column>
            <el-table-column>
              <template #header>
                <div style="display: flex; align-items: center;">
                  <div>目标仓库</div>
                  <el-button style="margin-left: 10px" @click="setWarehouseDialogVisible()">批量</el-button>
                </div>
              </template>
              <template #default="{ row }">
                <el-select :model-value="row.targetWarehouseId" placeholder="请选择目标仓库" @change="(newValue) => checkTargetWarehouseId(row, newValue)"
                           filterable>
                  <el-option v-for="item in useBasicStore().warehouseList" :key="item.id" :label="item.warehouseName"
                             :value="item.id"/>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="调拨数量" prop="qty" width="180" align="center">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.qty"
                  placeholder="调拨数量"
                  :min="1"
                  :precision="0"
                  @change="handleChangeQuantity"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="金额" prop="totalAmount" width="180" align="center">
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
          <el-button @click="doMovement" type="primary" class="ml10">完成调拨</el-button>
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

<script setup name="MovementOrderEdit">
import {computed, getCurrentInstance, onMounted, reactive, ref, toRef, toRefs, watch} from "vue";
import {addMovementOrder, getMovementOrder, updateMovementOrder, movement} from "@/api/wms/movementDoc";
import {delMovementOrderDetail} from "@/api/wms/movementDetailDoc";
import {ElMessage, ElMessageBox} from "element-plus";
import {useRoute} from "vue-router";
import {useBasicStore} from '@/store/modules/basic'
import {numSub, generateNo} from '@/utils/ruoyi'
import InventorySelect from "@/views/components/InventorySelect.vue";
import {getSourceWarehouseAndSkuKey, getWarehouseAndSkuKey} from "@/utils/wmsUtil";

const {proxy} = getCurrentInstance();
const {wms_shipment_type} = proxy.useDict("wms_shipment_type");

const loading = ref(false)
const batchSetWarehouseVisible = ref(false)
const batchSetWarehouseId = ref(null)
const initFormData = {
  id: undefined,
  docNo: undefined,
  remark: undefined,
  goodsAmount: undefined,
  goodsQty: 0,
  details: [],
}
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
  if (form.value.details.some(item => item.warehouseId === batchSetWarehouseId.value)) {
    ElMessage.error("源仓库和目标仓库不能相同！");
  }else {
    form.value.details.forEach(item => {
      if (item && typeof item === "object") {
        item.targetWarehouseId = batchSetWarehouseId.value;
      }
    });
    ElMessage.success("仓库批量设置成功");
  }
  batchSetWarehouseId.value = null;
  batchSetWarehouseVisible.value =false;
  // 提示操作成功
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
      {required: true, message: "请选择源仓库", trigger: ['blur', 'change']}
    ],
    targetWarehouseId: [
      {required: true, message: "请选择目标仓库", trigger: ['blur', 'change']}
    ],
  }
});
const {form, rules} = toRefs(data);
const cancel = async () => {
  await proxy?.$modal.confirm('确认取消编辑调拨单吗？');
  close()
}
const close = () => {
  const obj = {path: "/wms/movement"};
  proxy?.$tab.closeOpenPage(obj);
}
const inventorySelectShow = ref(false)

// 选择商品 start
const showAddItem = () => {
  inventorySelectRef.value.getList()
  inventorySelectShow.value = true
}
const checkTargetWarehouseId = (row, newValue)=>{
  if(newValue == row.warehouseId){
    ElMessage.error("目标仓库和源仓库不能相同")
  }else {
    row.targetWarehouseId = newValue
  }
}
// 选择成功
const handleOkClick = (item) => {
  inventorySelectShow.value = false
  selectedInventory.value = [...item]
  item.forEach(it => {
    if (!form.value.details.find(detail => getSourceWarehouseAndSkuKey(detail) === getWarehouseAndSkuKey(it))) {
      form.value.details.push(
        {
          sku: it.sku,
          goods: it.goods,
          skuId: it.skuId,
          goodsQty: undefined,
          goodsAmount: undefined,
          warehouseId: it.warehouseId
        })
    }
  })
}
// 选择商品 end

// 初始化receipt-order-form ref
const movementForm = ref()

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

const save = async () => {
  await proxy?.$modal.confirm('确认暂存调拨单吗？');
  doSave()
}
const getParams = (checkedStatus) => {
  let details = []
  if (form.value.details?.length) {
    // 构建参数
    details = form.value.details.map(it => {
      return {
        id: it.id,
        warehouseId: it.warehouseId,
        targetWarehouseId: it.targetWarehouseId,
        movementId: form.value.id,
        skuId: it.skuId,
        qty: it.qty,
        goodsAmount: it.goodsAmount
      }
    })
  }
  return {
    id: form.value.id,
    docNo: form.value.docNo,
    checkedStatus,
    remark: form.value.remark,
    goodsQty: form.value.goodsQty,
    goodsAmount: form.value.goodsAmount,
    details: details
  }
}
const doSave = (checkedStatus = 0) => {
  movementForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }

    const params = getParams(checkedStatus)
    loading.value = true
    if (params.id) {
      updateMovementOrder(params).then((res) => {
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
      addMovementOrder(params).then((res) => {
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

const doMovement = async () => {
  await proxy?.$modal.confirm('确认调拨吗？');
  movementForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }
    if (!form.value.details?.length) {
      return ElMessage.error('请选择商品')
    }
    const invalidQuantityList = form.value.details.filter(it => !it.qty)
    if (invalidQuantityList?.length) {
      return ElMessage.error('请选择调拨数量')
    }

    //('提交前校验',form.value)
    const params = getParams(1)
    loading.value = true
    movement(params).then((res) => {
      if (res.code === 200) {
        ElMessage.success('调拨成功')
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
    form.value.docNo = 'YK' + generateNo()
  }
})


// 获取调拨单详情
const loadDetail = (id) => {
  loading.value = true
  getMovementOrder(id).then((response) => {

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

const handleChangeSourceWarehouse = (e) => {
  form.value.details = []
  inventorySelectRef.value.setWarehouseId(form.value.warehouseId)
}

const handleChangeTargetWarehouse = (e) => {
  form.value.details.forEach(it => {
    it.targetWarehouseId = e
  })

}

const handleChangeQuantity = () => {
  let sum = 0
  form.value.details.forEach(it => {
    if (it.qty) {
      sum += Number(it.qty)
    }
  })
  form.value.goodsQty = sum
}

const handleDeleteDetail = (row, index) => {
  if (row.id) {
    proxy.$modal.confirm('确认删除本条商品明细吗？如确认会立即执行！').then(function () {
      loading.value = true
      return delMovementOrderDetail(row.id);
    }).then(() => {
      form.value.details.splice(index, 1)
      proxy.$modal.msgSuccess("删除成功");
    }).finally(() => {
      loading.value = false
    })
  } else {
    form.value.details.splice(index, 1)
  }
  const indexOfSelected = selectedInventory.value.findIndex(it => getWarehouseAndSkuKey(it) === getSourceWarehouseAndSkuKey(row))
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
