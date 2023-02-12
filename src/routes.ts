import { createRouter, createWebHashHistory } from 'vue-router'
import EnglishComplete from './views/EnglishComplete.vue'
const routes = [
    {
        path: '/',
        component: EnglishComplete,
        exact: true
    },
    {
        path: '/help',
        component: () => import('./views/Help.vue'),
        exact: true
    },
    {
        path: '/tasks',
        component: () => import('./views/Tasks.vue'),
        exact: true
    },
    {
        path: '/about',
        component: () => import('./views/About.vue'),
        exact: true
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router;

