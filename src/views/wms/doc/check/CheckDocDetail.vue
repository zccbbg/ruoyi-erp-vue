<template>
  <el-drawer :model-value="show" :title="'盘库单【' + docNo + '】的商品明细'" @close="handleCancelClick" :size="size" :close-on-click-modal="false"
             append-to-body>
    <div class="flex-space-between">
      <div></div>
      <el-checkbox v-model="queryParams.haveProfitAndLoss" label="只查看有盈亏数的" @change="handleQuery"/>
    </div>
    <el-table :data="list" border empty-text="暂无商品明细" v-loading="loading" ref="inventorySelectFormRef"
              cell-class-name="my-cell" class="mt20">
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
      <el-table-column label="账面库存" prop="qty" align="right">
        <template #default="{ row }">
          <el-statistic :value="Number(row.qty)" :precision="0"/>
        </template>
      </el-table-column>
      <el-table-column label="盈亏数" align="right">
        <template #default="{ row }">
          <el-statistic :value="Number(row.checkQty) - Number(row.qty)" :precision="0"/>
        </template>
      </el-table-column>
      <el-table-column label="实际库存" prop="checkQty" align="right">
        <template #default="{ row }">
          <el-statistic :value="Number(row.checkQty)" :precision="0"/>
        </template>
      </el-table-column>
    </el-table>
    <el-row>
      <pagination
        v-show="total>0"
        :total="total"
        v-model:limit="queryParams.pageSize"
        v-model:page="queryParams.pageNum"
        @pagination="getList"
        class="mr10"
      />
    </el-row>
  </el-drawer>

</template>

<script setup>
import {computed, reactive, ref} from "vue";
import {listCheckDocDetail} from "@/api/wms/checkDocDetail";

const list = ref([]);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: '80%'
  },
  docNo: {
    type: String,
    default: ''
  }
})
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  pid: null,
  haveProfitAndLoss: false,
});
const total = ref(0)
const loading = ref(false)
const show = computed(() => {
  return props.modelValue;
})
const emit = defineEmits(["handleCancelClick"]);

function setCheckDocId(docId) {
  queryParams.value.pid = docId
}

defineExpose({
  handleQuery,
  setCheckDocId
})
function handleCancelClick() {
  emit('handleCancelClick');
}



function getList() {
  loading.value = true;
  const query = {...queryParams.value}
  listCheckDocDetail(query).then(response => {
    list.value = response.rows;
    total.value = response.total;
  }).finally(() => loading.value = false);
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
</script>

<style lang="scss">
.el-table .my-cell {
  vertical-align: top
}

.el-statistic__content {
  font-size: 14px;
}
</style>
