import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { setupRouter } from './router';
import { setupStore } from './store';

const app = createApp(App);

setupStore(app);
setupRouter(app);

app.mount('#app');
