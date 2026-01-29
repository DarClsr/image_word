<template>
  <section class="login">
    <n-card class="login__card" size="large" bordered>
      <template #header>
        <div class="login__title">
          <div class="login__brand">IW</div>
          <div>
            <div class="login__headline">管理员登录</div>
            <n-text depth="3">请输入账号与密码。</n-text>
          </div>
        </div>
      </template>
      <n-form :model="form" size="large" class="login__form">
        <n-form-item label="账号">
          <n-input v-model:value="form.username" placeholder="admin" />
        </n-form-item>
        <n-form-item label="密码">
          <n-input v-model:value="form.password" type="password" placeholder="••••••" show-password-on="click" />
        </n-form-item>
        <n-space vertical size="large">
          <n-button class="login__submit" type="primary" size="large" block :loading="loading" @click="handleLogin">
            登录
          </n-button>
        </n-space>
      </n-form>
    </n-card>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { NButton, NCard, NForm, NFormItem, NInput, NSpace, NText, useMessage } from 'naive-ui';
import { useAuthStore } from '@/store/modules/auth';
import { login } from '@/api/auth';

const router = useRouter();
const route = useRoute();
const message = useMessage();
const authStore = useAuthStore();
const loading = ref(false);

const form = reactive({
  username: '',
  password: '',
});

const handleLogin = async () => {
  if (!form.username || !form.password) {
    message.warning('请输入账号与密码');
    return;
  }

  loading.value = true;
  try {
    const res = await login({
      username: form.username,
      password: form.password,
    });

    // 保存登录信息
    authStore.setLoginInfo({
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      admin: res.admin,
    });

    message.success('登录成功');
    const redirect = (route.query.redirect as string) || '/';
    router.replace(redirect);
  } catch (error: any) {
    message.error(error?.message || '登录失败，请检查账号密码');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-bg);
  padding: 24px;
}

.login__card {
  width: min(420px, 92vw);
  background: var(--color-bg-card, #fff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 18px;
  box-shadow: var(--shadow-soft, 0 10px 30px rgba(15, 23, 42, 0.08));
  position: relative;
  overflow: hidden;
}

.login__card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #22c55e);
}

.login__title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.login__brand {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #3b82f6, #22c55e);
  color: #fff;
  font-weight: 700;
  letter-spacing: 1px;
}

.login__headline {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 2px;
}

.login__form {
  margin-top: 10px;
}

.login :deep(input:-webkit-autofill),
.login :deep(input:-webkit-autofill:hover),
.login :deep(input:-webkit-autofill:focus) {
  -webkit-text-fill-color: var(--color-text);
  caret-color: var(--color-text);
}

.login :deep(input:-webkit-autofill),
.login :deep(input:-webkit-autofill:hover),
.login :deep(input:-webkit-autofill:focus) {
  -webkit-text-fill-color: var(--color-text);
  caret-color: var(--color-text);
  transition: background-color 9999s ease-in-out 0s;
  box-shadow: 0 0 0 1000px transparent inset;
}

.login__submit {
  background: linear-gradient(135deg, #3b82f6, #22c55e);
  border: none;
  box-shadow: 0 10px 24px rgba(59, 130, 246, 0.3);
}

.login__submit:hover {
  background: linear-gradient(135deg, #2563eb, #16a34a);
}

.login__hint {
  text-align: center;
}
</style>
