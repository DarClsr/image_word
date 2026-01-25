<template>
  <section class="page">
    <div class="card">
      <h1>404</h1>
      <p>页面不存在或已被移除。</p>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
.page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.card {
  padding: 24px 28px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #eef0f3;
  text-align: center;
}

.card h1 {
  margin: 0;
  font-size: 28px;
}

.card p {
  margin: 8px 0 0;
  color: #6b7280;
}
</style>
