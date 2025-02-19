import { listWarehouseNoPage } from '@/api/basic/warehouse';
import { listMerchantNoPage } from "@/api/basic/merchant";
import { listCategory, treeSelectCategory } from "@/api/basic/category";
import { listBrand } from "@/api/basic/brand";
import {defineStore} from "pinia";
import {ref} from "vue";
import {listBankAccountNoPage} from "@/api/basic/bankAccount";

export const useBasicStore = defineStore('wms', () => {

  // 仓库管理
  const warehouseList = ref([]);
  const warehouseMap = ref(new Map());

  const getWarehouseList = () => {
    listWarehouseNoPage({}).then((res) => {
      warehouseList.value = res.data;
      const map = new Map();
      warehouseList.value.forEach((supplier) => {
        map.set(supplier.id, supplier);
      });
      warehouseMap.value = map;
    });
  };

  // 企业管理
  const merchantList = ref([]);
  const supplierList = ref([]);
  const customerList = ref([]);
  const merchantMap = ref(new Map());

  const getMerchantList = () => {
    listMerchantNoPage({}).then((res) => {
      merchantList.value = res.data;
      supplierList.value = res.data.filter(item => item.merchantTypeSupplier === 1);
      customerList.value = res.data.filter(item => item.merchantTypeCustomer === 1);
      const map = new Map();
      merchantList.value.forEach((supplier) => {
        map.set(supplier.id, supplier);
      });
      merchantMap.value = map;
    });
  }

  const getBankAccountList = () => {
    listBankAccountNoPage({}).then((res) => {
      bankAccountList.value = res.data;
      const map = new Map()
      bankAccountList.value.forEach(item => {
        map.set(item.id, item)
      })
      bankAccountMap.value = map
    });
  }

  // 商品分类管理
  const categoryList = ref([])
  const categoryTreeList = ref([])
  const categoryMap = ref(new Map())

  const getCategoryList = () => {
    return new Promise((resolve, reject) => {
      listCategory({}).then(res => {
        categoryList.value = res.data;
        const map = new Map()
        categoryList.value.forEach(supplier => {
          map.set(supplier.id, supplier)
        })
        categoryMap.value = map
        resolve()
      }).catch(() => reject())
    })
  }

  const getCategoryTreeList = async () => {
    return new Promise((resolve, reject) => {
      treeSelectCategory().then(res => {
        categoryTreeList.value = res.data
        resolve(res.data)
      }).catch(() => reject())
    })
  }

  const bankAccountList = ref([])
  const bankAccountMap= ref(new Map())
  // 商品品牌管理
  const brandList = ref([])
  const brandMap = ref(new Map())

  const getBrandList =  () => {
    return new Promise((resolve, reject) => {
      listBrand({}).then(res => {
        brandList.value = res.data
        const map = new Map()
        brandList.value.forEach(supplier => {
          map.set(supplier.id, {...supplier})
        })
        brandMap.value = map
        resolve()
      }).catch(() => reject())
    })
  }

  return {
    // 仓库管理
    warehouseList,
    warehouseMap,
    getWarehouseList,
    // 企业管理
    merchantList,
    bankAccountList,
    bankAccountMap,
    supplierList,
    customerList,
    merchantMap,
    getMerchantList,
    getBankAccountList,
    // 商品分类管理
    categoryList,
    categoryTreeList,
    categoryMap,
    getCategoryList,
    getCategoryTreeList,
    // 商品品牌管理
    brandList,
    brandMap,
    getBrandList
  };
});
