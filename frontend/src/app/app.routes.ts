import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { AdminPanel } from './pages/admin-panel/admin-panel';
import { Notifications } from './pages/notifications/notifications';
import { Block } from './pages/block/block';
import { Subscriptions } from './pages/subscriptions/subscriptions';
import { MainLayout } from './layout/main-layout';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            },
            {
                path: 'home',
                component: Home
            },
            {
                path: 'admin',
                component: AdminPanel
            },
            {
                path: 'notifications',
                component: Notifications
            },
            {
                path: 'block',
                component: Block
            },
            {
                path: 'block/:username',
                component: Block
            },
            {
                path: 'subscriptions',
                component: Subscriptions
            }
        ]
    },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'register',
        component: Register
    }
];
