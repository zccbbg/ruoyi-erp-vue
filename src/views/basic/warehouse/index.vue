<template>
  <div class="app-container">
    <el-card>

      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="6"><span style="font-size: large">仓库列表</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['basic:warehouse:add']"
          >新增</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="warehouseList" border class="mt20" empty-text="暂无品牌">
        <el-table-column label="仓库名称" prop="warehouseName" />
        <el-table-column label="仓库编号" prop="warehouseNo" />
        <el-table-column label="创建时间" prop="createTime" width="180"/>
        <el-table-column label="操作" align="right" class-name="small-padding fixed-width" width="180">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['basic:warehouse:edit']">修改</el-button>
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['basic:warehouse:remove']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

    </el-card>
    <!-- 添加或修改仓库对话框 -->
    <el-drawer :title="dialog.title" v-model="dialog.visible" size="50%" append-to-body>
      <el-form ref="warehouseFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="warehouseName">
          <el-input v-model="form.warehouseName" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="编号" prop="warehouseNo">
          <el-input v-model="form.warehouseNo" placeholder="请输入编号" />
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

<script setup name="Warehouse">
import {
  getWarehouse,
  delWarehouse,
  addWarehouse,
  updateWarehouse,
  listWarehouseNoPage
} from '@/api/basic/warehouse';
import {getCurrentInstance, nextTick, onMounted, reactive, ref, toRefs} from 'vue';
import {ElForm, ElMessageBox, ElTree} from 'element-plus';
import useUserStore from "@/store/modules/user";
import {useWmsStore} from "@/store/modules/wms";
const wmsStore = useWmsStore();
const { proxy } = getCurrentInstance();

const customNodeClass = (data, node) => {
  if (data.warehouseNo) {
    return 'warehouseNo';
  }
  return null
}
const warehouseList = ref([]);
const buttonLoading = ref(false);
const loading = ref(false);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const queryFormRef = ref(ElForm);
const warehouseFormRef = ref(ElForm);
const dialog = reactive({
  visible: false,
  title: ''
});
const initFormData = {
  id: undefined,
  warehouseNo: undefined,
  warehouseName: undefined
}
const data = reactive({
  form: {},
  queryParams: {
    warehouseNo: undefined,
    warehouseName: undefined,
  },
  rules: {
    id: [
      { required: true, message: "不能为空", trigger: "blur" }
    ],
    warehouseName: [
      { required: true, message: "名称不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);


const selectedWarehouseId = ref()


/** 查询仓库列表 */
const getList = async () => {
  loading.value = true;
  const res = await listWarehouseNoPage(queryParams.value).finally(()=>{
    loading.value = false;
  });
  warehouseList.value = res.data;
  total.value = res.total;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  proxy.resetForm("warehouseFormRef");
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields();
  handleQuery();
}

// /** 多选框选中数据

/** 新增按钮操作 */
const handleAdd = async () => {

      dialog.visible = true;
      dialog.title = "添加仓库";
      nextTick(() => {
        reset();
      });
}

/** 修改按钮操作 */
const handleUpdate = (data) => {

  reset();
  const _id = data.id
  getWarehouse(_id).then(response => {
    Object.assign(form.value, response.data);
    dialog.visible = true;
    dialog.title = "修改仓库";
  });
}

/** 提交按钮 */
const submitForm = () => {
  warehouseFormRef.value.validate(async (valid) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateWarehouse(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addWarehouse(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess(form.value.id ? '修改成功' : '新增成功');
      dialog.visible = false;
      await getList();
      wmsStore.getWarehouseList()
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (data) => {
  const _ids = data.id;
  await proxy?.$modal.confirm('确认删除仓库【' + data.warehouseName + '】吗？').finally(() => loading.value = false);
  await delWarehouse(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
  wmsStore.getWarehouseList()
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('basic/warehouse/export', {
    ...queryParams.value
  }, `warehouse_${new Date().getTime()}.xlsx`)
}
onMounted(async () => {
  await getList();
});
</script>
<style lang="scss">
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
.el-tree-node__content {
  display: flex;
  align-items: center;
  height: 35px;
  cursor: pointer;
}
.el-message-box__content {
  font-size: 16px;
}
</style>
