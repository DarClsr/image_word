import { ref, reactive, computed, type Ref } from 'vue';

/**
 * 分页参数
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  pageSizes: number[];
}

/**
 * 表格配置选项
 */
export interface UseTableOptions<T, Q> {
  /** 获取数据的 API 函数 */
  fetchApi: (params: Q & { page: number; pageSize: number }) => Promise<{
    list: T[];
    total: number;
  }>;
  /** 默认查询参数 */
  defaultQuery?: Partial<Q>;
  /** 默认分页大小 */
  defaultPageSize?: number;
  /** 是否立即加载 */
  immediate?: boolean;
}

/**
 * 表格通用逻辑组合函数
 */
export const useTable = <T extends object, Q extends object = object>(
  options: UseTableOptions<T, Q>
) => {
  const { fetchApi, defaultQuery = {}, defaultPageSize = 20, immediate = true } = options;

  /** 数据列表 */
  const dataList: Ref<T[]> = ref([]);

  /** 加载状态 */
  const loading = ref(false);

  /** 查询参数 */
  const queryParams = reactive<Q>({ ...defaultQuery } as Q);

  /** 分页参数 */
  const pagination = reactive<Pagination>({
    page: 1,
    pageSize: defaultPageSize,
    total: 0,
    pageSizes: [10, 20, 50, 100],
  });

  /** 选中的行 */
  const selectedKeys: Ref<(string | number)[]> = ref([]);
  const selectedRows: Ref<T[]> = ref([]);

  /** 是否有选中项 */
  const hasSelected = computed(() => selectedKeys.value.length > 0);

  /** 选中数量 */
  const selectedCount = computed(() => selectedKeys.value.length);

  /**
   * 获取数据
   */
  const fetchData = async () => {
    loading.value = true;
    try {
      const result = await fetchApi({
        ...queryParams,
        page: pagination.page,
        pageSize: pagination.pageSize,
      } as Q & { page: number; pageSize: number });

      dataList.value = result.list;
      pagination.total = result.total;
    } catch (error) {
      console.error('获取表格数据失败:', error);
      dataList.value = [];
      pagination.total = 0;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 刷新数据（保持当前页）
   */
  const refresh = () => {
    return fetchData();
  };

  /**
   * 重置并刷新（回到第一页）
   */
  const reset = () => {
    pagination.page = 1;
    Object.assign(queryParams, defaultQuery);
    clearSelection();
    return fetchData();
  };

  /**
   * 搜索（回到第一页）
   */
  const search = () => {
    pagination.page = 1;
    return fetchData();
  };

  /**
   * 分页变化
   */
  const onPageChange = (page: number) => {
    pagination.page = page;
    fetchData();
  };

  /**
   * 每页大小变化
   */
  const onPageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    fetchData();
  };

  /**
   * 选择变化
   */
  const onSelectionChange = (keys: (string | number)[], rows: T[]) => {
    selectedKeys.value = keys;
    selectedRows.value = rows;
  };

  /**
   * 清空选择
   */
  const clearSelection = () => {
    selectedKeys.value = [];
    selectedRows.value = [];
  };

  /**
   * 更新查询参数
   */
  const updateQuery = (params: Partial<Q>) => {
    Object.assign(queryParams, params);
  };

  /** 立即加载 */
  if (immediate) {
    fetchData();
  }

  return {
    // 数据
    dataList,
    loading,
    queryParams,
    pagination,
    selectedKeys,
    selectedRows,
    // 计算属性
    hasSelected,
    selectedCount,
    // 方法
    fetchData,
    refresh,
    reset,
    search,
    onPageChange,
    onPageSizeChange,
    onSelectionChange,
    clearSelection,
    updateQuery,
  };
};

/**
 * 简单表格（不带分页）
 */
export const useSimpleTable = <T extends object>(fetchApi: () => Promise<T[]>) => {
  const dataList: Ref<T[]> = ref([]);
  const loading = ref(false);

  const fetchData = async () => {
    loading.value = true;
    try {
      dataList.value = await fetchApi();
    } catch (error) {
      console.error('获取数据失败:', error);
      dataList.value = [];
    } finally {
      loading.value = false;
    }
  };

  fetchData();

  return {
    dataList,
    loading,
    refresh: fetchData,
  };
};
