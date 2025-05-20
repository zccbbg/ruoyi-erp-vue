<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
        <el-form-item label="审核状态" prop="checkedStatus">
          <el-radio-group v-model="queryParams.checkedStatus" @change="handleQuery">
            <el-radio-button
              :key="-2"
              :label="-2"
            >
              全部
            </el-radio-button>
            <el-radio-button
              v-for="item in wms_check_status"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="盘库单号" prop="docNo">
          <el-input
            v-model="queryParams.docNo"
            placeholder="请输入盘库单号"
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
        <el-col :span="6"><span style="font-size: large">盘库单</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['wms:check:all']"
          >新增</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="checkDocList" border class="mt20"
                :row-key="getRowKey"
                empty-text="暂无盘库单"
                cell-class-name="vertical-top-cell"
      >
        <el-table-column label="单号" align="left" prop="docNo" />
        <el-table-column label="仓库" align="left" width="200">
          <template #default="{ row }">
            <div>{{ useBasicStore().warehouseMap.get(row.warehouseId)?.warehouseName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" align="center" prop="checkedStatus" width="120">
          <template #default="{ row }">
            <dict-tag :options="wms_check_status" :value="row.checkedStatus" />
          </template>
        </el-table-column>
        <el-table-column label="盈亏数" align="right">
          <template #default="{ row }">
            <el-statistic :value="Number(row.goodsQty)" :precision="0"/>
          </template>
        </el-table-column>
        <el-table-column label="操作时间" align="left" width="200">
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
                :content="'盘库单【' + scope.row.docNo + '】已' + (scope.row.checkedStatus === 1 ? '盘库完成' : '作废') + '，无法修改！' "
              >
                <template #reference>
                  <el-button link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['wms:check:all']" :disabled="[-1, 1].includes(scope.row.checkedStatus)">修改</el-button>
                </template>
              </el-popover>
              <el-button link type="primary" @click="handleGoDetail(scope.row)" v-hasPermi="['wms:check:all']">查看</el-button>
            </div>
            <div class="mt10">
              <el-popover
                placement="left"
                title="提示"
                :width="300"
                trigger="hover"
                :disabled="[-1, 0].includes(scope.row.checkedStatus)"
                :content="'盘库单【' + scope.row.docNo + '】已盘库完成，无法删除！' "
              >
                <template #reference>
                  <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['wms:check:all']" :disabled="scope.row.checkedStatus === 1">删除</el-button>
                </template>
              </el-popover>
              <el-button link type="primary" @click="handlePrint(scope.row)" v-hasPermi="['wms:check:all']">打印</el-button>
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
    <check-doc-detail
      ref="checkDocDetailRef"
      :model-value="watchDetailObj.show"
      :doc-no="watchDetailObj.docNo"
      @handle-cancel-click="watchDetailObj.show = false"
    />
  </div>
</template>

<script setup name="CheckDoc">
import {listCheckDoc, delCheckDoc, getCheckDoc} from "@/api/wms/checkDoc";
import {listByCheckDocId} from "@/api/wms/checkDocDetail";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {useBasicStore} from "../../../../store/modules/basic";
import {ElMessageBox} from "element-plus";
import checkPanel from "@/components/PrintTemplate/check-panel";
import CheckDocDetail from "@/views/wms/doc/check/CheckDocDetail.vue";
const { proxy } = getCurrentInstance();
const {wms_check_status} = proxy.useDict("wms_check_status");
const checkDocList = ref([]);
const open = ref(false);
const buttonLoading = ref(false);
const loading = ref(true);
const ids = ref([]);
const total = ref(0);
const title = ref("");
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    docNo: undefined,
    checkedStatus: -2,
  },
});
const watchDetailObj = ref({
  show: false,
  docNo: null
})
const checkDocDetailRef = ref(null)
const { queryParams } = toRefs(data);

/** 查询入库单列表 */
function getList() {
  loading.value = true;
  const query = {...queryParams.value}
  if (query.checkedStatus === -2) {
    query.checkedStatus = null
  }
  listCheckDoc(query).then(response => {
    checkDocList.value = response.rows;
    total.value = response.total;
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
  proxy.$router.push({ path: "/wms/checkEdit" });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('确认删除【盘库单【' + row.docNo + '】吗？').then(function() {
    loading.value = true;
    return delCheckDoc(_ids);
  }).then(() => {
    proxy.$modal.msgSuccess("删除成功");
  }).finally(() => {
    loading.value = false;
    getList();
  });
}

function handleUpdate(row) {
  proxy.$router.push({ path: "/wms/checkEdit",  query: { id: row.id } });
}

function handleGoDetail(row) {
  watchDetailObj.value.docNo = row.docNo
  checkDocDetailRef.value.setCheckDocId(row.id)
  watchDetailObj.value.show = true
  checkDocDetailRef.value.handleQuery()
}

/** 导出按钮操作 */
async function handlePrint(row) {
  const res = await getCheckDoc(row.id)
  const checkDoc = res.data
  let table = []
  if (checkDoc.details?.length) {
    table = checkDoc.details.map(detail => {
      return {
        itemName: detail.item.itemName,
        skuName: detail.itemSku.skuName,
        goodsQty: Number(detail.goodsQty).toFixed(0),
        profitAndLoss: Number(detail.checkQuantity - detail.goodsQty).toFixed(0),
        checkQuantity: Number(detail.checkQuantity).toFixed(0)
      }
    })
  }
  const printData = {
    docNo: checkDoc.docNo,
    checkedStatus: proxy.selectDictLabel(wms_check_status.value, checkDoc.checkedStatus),
    warehouseName: useBasicStore().warehouseMap.get(checkDoc.warehouseId)?.warehouseName,
    goodsQty: Number(checkDoc.goodsQty).toFixed(0),
    createBy: checkDoc.createBy,
    createTime: proxy.parseTime(checkDoc.createTime, '{mm}-{dd} {hh}:{ii}'),
    updateBy: checkDoc.updateBy,
    updateTime: proxy.parseTime(checkDoc.updateTime, '{mm}-{dd} {hh}:{ii}'),
    remark: checkDoc.remark,
    table
  }
  let printTemplate = new proxy.$hiprint.PrintTemplate({template: checkPanel})
  printTemplate.print(printData, {}, {
    styleHandler: () => {
      let css = '<link href="https://cyl-press.oss-cn-shenzhen.aliyuncs.com/print-lock.css" media="print" rel="stylesheet">';
      return css
    }
  })
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
