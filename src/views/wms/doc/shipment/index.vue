<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="90px">
        <el-form-item label="审核状态" prop="checkedStatus"  class="col4">
          <el-select v-model="queryParams.checkedStatus" placeholder="请选择审核状态" clearable style="width: 100%">
            <el-option
              v-for="dict in finish_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="出库单号" prop="docNo"  class="col4">
          <el-input
            v-model="queryParams.docNo"
            placeholder="请输入出库单号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item  class="col4" style="margin-left: 32px">
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt20">

      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="6"><span style="font-size: large">出库单</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['wms:shipment:all']"
          >新增</el-button>
        </el-col>
      </el-row>
      <el-table v-loading="loading" :data="shipmentList" border class="mt20"
                @expand-change="handleExpandExchange"
                :row-key="getRowKey"
                :expand-row-keys="expandedRowKeys"
                empty-text="暂无出库单"
                cell-class-name="vertical-top-cell"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div style="padding: 0 50px 20px 50px">
              <h3>商品明细</h3>
              <el-table :data="props.row.details" v-loading="detailLoading[props.$index]" empty-text="暂无商品明细">
                <el-table-column label="商品名称">
                  <template #default="{ row }">
                    <div>{{ row?.goods?.goodsName }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="规格名称">
                  <template #default="{ row }">
                    <div>{{ row?.sku?.skuName }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="仓库" align="left">
                  <template #default="{ row }">
                    <div>{{ useBasicStore().warehouseMap.get(row.warehouseId)?.warehouseName }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="数量" prop="qty" align="right">
                  <template #default="{ row }">
                    <el-statistic :value="Number(row.qty)" :precision="0"/>
                  </template>
                </el-table-column>
                <el-table-column label="金额(元)" align="right">
                  <template #default="{ row }">
                    <el-statistic v-if="row.totalAmount || row.totalAmount === 0" :precision="2" :value="Number(row.totalAmount)"/>
                    <div v-else>-</div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="单号" align="left" min-width="60" prop="docNo">
        </el-table-column>
        <el-table-column label="仓库" align="left">
          <template #default="{ row }">
            <div>{{ useBasicStore().warehouseMap.get(row.warehouseId)?.warehouseName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="总数量/总金额(元)" align="left" min-width="100">
          <template #default="{ row }">
            <div class="flex-space-between">
              <span>数量：</span>
              <el-statistic :value="Number(row.goodsQty)" :precision="0"/>
            </div>
            <div class="flex-space-between" v-if="row.goodsAmount || row.goodsAmount === 0">
              <span>金额：</span>
              <el-statistic :value="Number(row.goodsAmount)" :precision="2"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" align="center" prop="checkedStatus" width="80">
          <template #default="{ row }">
            <dict-tag :options="finish_status" :value="row.checkedStatus" />
          </template>
        </el-table-column>
        <el-table-column label="操作时间" align="left" width="150">
          <template #default="{ row }">
            <div>创建：{{ parseTime(row.createTime, '{mm}-{dd} {hh}:{ii}') }}</div>
            <div>更新：{{ parseTime(row.updateTime, '{mm}-{dd} {hh}:{ii}') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作人" align="left">
          <template #default="{ row }">
            <div>{{ row.createBy }}</div>
            <div v-if="row.updateBy">{{ row.updateBy }}</div>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" />
        <el-table-column label="操作" align="right" class-name="small-padding fixed-width" width="120">
          <template #default="scope">
            <div>
              <el-popover
                placement="left"
                title="提示"
                :width="300"
                trigger="hover"
                :disabled="scope.row.checkedStatus === 0"
                :content="'出库单【' + scope.row.docNo + '】已出库，无法修改！' "
              >
                <template #reference>
                  <el-button link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['wms:shipment:all']" :disabled="[1].includes(scope.row.checkedStatus)">修改</el-button>
                </template>
              </el-popover>
              <el-button link type="primary" @click="handleGoDetail(scope.row)" v-hasPermi="['wms:shipment:all']">{{ expandedRowKeys.includes(scope.row.id) ? '收起' : '查看' }}</el-button>
            </div>
            <div class="mt10">
              <el-popover
                placement="left"
                title="提示"
                :width="300"
                trigger="hover"
                :disabled="[0].includes(scope.row.checkedStatus)"
                :content="'出库单【' + scope.row.docNo + '】已出库，无法删除！' "
              >
                <template #reference>
                  <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['wms:shipment:all']" :disabled="scope.row.checkedStatus === 1">删除</el-button>
                </template>
              </el-popover>
              <el-button link type="primary" @click="handlePrint(scope.row)" v-hasPermi="['wms:shipment:all']">打印</el-button>
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
  </div>
</template>

<script setup name="ShipmentOrder">
import {listShipmentOrder, delShipmentOrder, getShipmentOrder} from "@/api/wms/shipmentDoc";
import {listByShipmentOrderId} from "@/api/wms/shipmentDocDetail";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {useBasicStore} from "../../../../store/modules/basic";
import shipmentPanel from "@/components/PrintTemplate/shipment-panel";
const { proxy } = getCurrentInstance();
const { wms_shipment_status} = proxy.useDict("wms_shipment_status");
const { finish_status } = proxy.useDict('finish_status');
const shipmentList = ref([]);
const open = ref(false);
const buttonLoading = ref(false);
const loading = ref(true);
const ids = ref([]);
const total = ref(0);
const title = ref("");
// 当前展开集合
const expandedRowKeys = ref([])
// 商品明细table的loading状态集合
const detailLoading = ref([])
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    docNo: undefined,
    merchantId: undefined,
    goodsAmount: undefined,
    checkedStatus: undefined,
  },
});

const { queryParams } = toRefs(data);

/** 查询入库单列表 */
function getList() {
  loading.value = true;
  const query = {...queryParams.value}
  if (query.checkedStatus === -2) {
    query.checkedStatus = null
  }
  listShipmentOrder(query).then(response => {
    shipmentList.value = response.rows;
    total.value = response.total;
    for (let i = 0; i < total; i++) {
      detailLoading.value.push(false)
    }
    expandedRowKeys.value = []
    loading.value = false;
  });
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
  proxy.$router.push({ path: "/wms/shipmentEdit" });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('确认删除出库单【' + row.docNo + '】吗？').then(function() {
    loading.value = true;
    return delShipmentOrder(_ids);
  }).then(() => {
    proxy.$modal.msgSuccess("删除成功");
  }).finally(() => {
    loading.value = false;
    getList();
  });
}

function handleUpdate(row) {
  proxy.$router.push({ path: "/wms/shipmentEdit",  query: { id: row.id } });
}

function handleGoDetail(row) {
  const index = expandedRowKeys.value.indexOf(row.id)
  if (index !== -1) {
    // 收起
    expandedRowKeys.value.splice(index, 1)
  } else {
    // 展开
    expandedRowKeys.value.push(row.id)
    loadShipmentOrderDetail(row)
  }
}

/** 导出按钮操作 */
async function handlePrint(row) {
  const res = await getShipmentOrder(row.id)
  const shipment = res.data
  let table = []
  if (shipment.details?.length) {
    table = shipment.details.map(detail => {
      return {
        goodsName: detail.goodsName,
        skuName: detail.sku.skuName,
        qty: Number(detail.qty).toFixed(0),
        totalAmount: detail.totalAmount
      }
    })
  }
  const printData = {
    docNo: shipment.docNo,
    checkedStatus: proxy.selectDictLabel(wms_shipment_status.value, shipment.checkedStatus),
    merchantName: useBasicStore().merchantMap.get(shipment.merchantId)?.merchantName,
    warehouseName: useBasicStore().warehouseMap.get(shipment.warehouseId)?.warehouseName,
    goodsQty: Number(shipment.goodsQty).toFixed(0),
    goodsAmount: ((shipment.goodsAmount || shipment.goodsAmount === 0) ? (shipment.goodsAmount + '元') : ''),
    createBy: shipment.createBy,
    createTime: proxy.parseTime(shipment.createTime, '{mm}-{dd} {hh}:{ii}'),
    updateBy: shipment.updateBy,
    updateTime: proxy.parseTime(shipment.updateTime, '{mm}-{dd} {hh}:{ii}'),
    remark: shipment.remark,
    table
  }
  let printTemplate = new proxy.$hiprint.PrintTemplate({template: shipmentPanel})
  printTemplate.print(printData, {}, {
    styleHandler: () => {
      return '<link href="https://cyl-press.oss-cn-shenzhen.aliyuncs.com/print-lock.css" media="print" rel="stylesheet">';
    }
  })
}


function handleExpandExchange(value, expandedRows) {
  if (!ifExpand(expandedRows)) {
    return
  }
  expandedRowKeys.value = expandedRows.map(it => it.id)
  loadShipmentOrderDetail(value)
}

function loadShipmentOrderDetail(row) {
  const index = shipmentList.value.findIndex(it => it.id === row.id)
  detailLoading.value[index] = true
  listByShipmentOrderId(row.id).then(res => {
    if (res.data?.length) {
      const details = res.data.map(it => {
        return {
          ...it,
          warehouseName: useBasicStore().warehouseMap.get(it.warehouseId)?.warehouseName
        }
      })
      shipmentList.value[index].details = details
    }
  }).finally(() => {
    detailLoading.value[index] = false
  })
}

function ifExpand(expandedRows) {
  if (expandedRows.length < expandedRowKeys.value.length) {
    expandedRowKeys.value = expandedRows.map(it => it.id)

    return false;
  }

  return true
}

function getRowKey(row) {
  return row.id
}
getList();
</script>
<style lang="scss">
.el-statistic__content {
  font-size: 14px;
}
.el-table .vertical-top-cell {
  vertical-align: top
}
</style>
