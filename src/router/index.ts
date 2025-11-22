import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import MainLayout from '@/components/templates/MainLayout.vue'
import DashboardView from '@/views/main/DashboardView.vue'
import DriverManagementView from '@/views/main/DriverManagementView.vue'
import DriverTrackingView from '@/views/main/DriverTrackingView.vue'
import StaffManagementView from '@/views/main/StaffManagementView.vue'
import TariffManagementView from '@/views/main/TariffManagementView.vue'
import ArgoTariffView from '@/views/main/ArgoTariffView.vue'
import OrderManagementView from '@/views/main/OrderManagementView.vue'
import ProfileView from '@/views/main/ProfileView.vue'
import CarManagementView from '@/views/main/CarManagementView.vue'
import PassengerManagementView from '@/views/main/PassengerManagementView.vue'
import DiscountManagementView from '@/views/main/DiscountManagementView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: MainLayout,
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: '/dashboard',
          name: 'dashboard',
          component: DashboardView,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: '/driver-management',
          name: 'driverManagement',
          component: DriverManagementView,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: '/staff-management',
          name: 'staffManagement',
          component: StaffManagementView,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: '/order-management',
          name: 'orderManagement',
          component: OrderManagementView,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: '/tariff-management',
          name: 'tariffManagement',
          component: TariffManagementView,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: '/argo-tariff-management',
          name: 'ArgoTariffManagement',
          component: ArgoTariffView,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: '/car-management',
          name: 'carManagement',
          component: CarManagementView,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: '/driver-tracking',
          name: 'driverTracking',
          component: DriverTrackingView,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: '/passenger-management',
          name: 'passengerManagement',
          component: PassengerManagementView,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: '/discount-management',
          name: 'discountManagement',
          component: DiscountManagementView,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: '/profile',
          name: 'profile',
          component: ProfileView,
          meta: {
            requiresAuth: true
          }
        }, {
          path: '/orders/create-manual',
          name: 'AdminCreateOrder',
          component: () => import('@/views/main/AdminCreateOrderView.vue'),
          meta: {
            requiresAuth: true,
            // tambahkan meta role kalau perlu
          }
        }, {
          path: '/reports/income',
          name: 'IncomeReport',
          component: () => import('@/views/reports/IncomeReportView.vue'),
          meta: {
            requiresAuth: true
          }
        }

      ]
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    }
  ]
})

export default router
