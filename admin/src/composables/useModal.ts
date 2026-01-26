import { ref, reactive, computed, type Ref } from 'vue';

/**
 * 弹窗模式
 */
export type ModalMode = 'create' | 'edit' | 'view';

/**
 * 弹窗配置选项
 */
export interface UseModalOptions<T> {
  /** 初始表单数据 */
  defaultFormData?: Partial<T>;
  /** 提交前的验证函数 */
  beforeSubmit?: (data: T, mode: ModalMode) => boolean | Promise<boolean>;
  /** 提交 API */
  submitApi?: (data: T, mode: ModalMode) => Promise<unknown>;
  /** 提交成功回调 */
  onSuccess?: (mode: ModalMode) => void;
}

/**
 * 弹窗通用逻辑组合函数
 */
export const useModal = <T extends object>(options: UseModalOptions<T> = {}) => {
  const { defaultFormData = {}, beforeSubmit, submitApi, onSuccess } = options;

  /** 弹窗显示状态 */
  const visible = ref(false);

  /** 弹窗模式 */
  const mode: Ref<ModalMode> = ref('create');

  /** 加载状态 */
  const loading = ref(false);

  /** 表单数据 */
  const formData = reactive<T>({ ...defaultFormData } as T);

  /** 原始数据（编辑时保存） */
  const originalData: Ref<T | null> = ref(null);

  /** 弹窗标题 */
  const title = computed(() => {
    const titles: Record<ModalMode, string> = {
      create: '新增',
      edit: '编辑',
      view: '查看',
    };
    return titles[mode.value];
  });

  /** 是否为只读模式 */
  const isReadonly = computed(() => mode.value === 'view');

  /** 是否为编辑模式 */
  const isEdit = computed(() => mode.value === 'edit');

  /** 是否为新增模式 */
  const isCreate = computed(() => mode.value === 'create');

  /**
   * 打开弹窗
   * @param m 模式
   * @param data 初始数据（编辑/查看时传入）
   */
  const open = (m: ModalMode = 'create', data?: Partial<T>) => {
    mode.value = m;
    if (data) {
      Object.assign(formData, { ...defaultFormData, ...data });
      originalData.value = { ...data } as T;
    } else {
      Object.assign(formData, { ...defaultFormData });
      originalData.value = null;
    }
    visible.value = true;
  };

  /**
   * 关闭弹窗
   */
  const close = () => {
    visible.value = false;
    loading.value = false;
  };

  /**
   * 重置表单
   */
  const resetForm = () => {
    Object.assign(formData, { ...defaultFormData });
  };

  /**
   * 提交表单
   */
  const submit = async (): Promise<boolean> => {
    // 前置验证
    if (beforeSubmit) {
      const valid = await beforeSubmit(formData as T, mode.value);
      if (!valid) return false;
    }

    // 调用 API
    if (submitApi) {
      loading.value = true;
      try {
        await submitApi(formData as T, mode.value);
        onSuccess?.(mode.value);
        close();
        return true;
      } catch (error) {
        console.error('提交失败:', error);
        return false;
      } finally {
        loading.value = false;
      }
    }

    close();
    return true;
  };

  /**
   * 更新表单数据
   */
  const updateForm = (data: Partial<T>) => {
    Object.assign(formData, data);
  };

  /**
   * 获取表单数据的副本
   */
  const getFormData = (): T => {
    return { ...formData } as T;
  };

  return {
    // 状态
    visible,
    mode,
    loading,
    formData,
    originalData,
    // 计算属性
    title,
    isReadonly,
    isEdit,
    isCreate,
    // 方法
    open,
    close,
    resetForm,
    submit,
    updateForm,
    getFormData,
  };
};

/**
 * 确认弹窗组合函数
 */
export const useConfirm = () => {
  const visible = ref(false);
  const loading = ref(false);
  const title = ref('确认操作');
  const content = ref('确定要执行此操作吗？');
  const type: Ref<'info' | 'warning' | 'error'> = ref('warning');

  let resolveCallback: ((value: boolean) => void) | null = null;

  /**
   * 显示确认弹窗
   */
  const confirm = (options: {
    title?: string;
    content: string;
    type?: 'info' | 'warning' | 'error';
  }): Promise<boolean> => {
    title.value = options.title || '确认操作';
    content.value = options.content;
    type.value = options.type || 'warning';
    visible.value = true;

    return new Promise((resolve) => {
      resolveCallback = resolve;
    });
  };

  /**
   * 确认
   */
  const handleConfirm = () => {
    resolveCallback?.(true);
    visible.value = false;
  };

  /**
   * 取消
   */
  const handleCancel = () => {
    resolveCallback?.(false);
    visible.value = false;
  };

  return {
    visible,
    loading,
    title,
    content,
    type,
    confirm,
    handleConfirm,
    handleCancel,
  };
};
