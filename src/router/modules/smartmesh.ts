import { AppRouteRecord } from '@/types/router'

export const smartmeshRouters : AppRouteRecord = {
    name: 'DeviceManager',
    path: '/device',
    component: "/index/index",
    meta: {
      title: 'menus.device.title',
      icon: '&#xe721;'
    },
    children: [
      {
        path: 'product',
        name: 'Product',
        component: "/device/product",
        meta: {
          title: 'menus.device.product',
          keepAlive: false
        }
      },
      {
        path: 'device',
        name: 'device',
        component: "/device/device",
        meta: {
          title: 'menus.device.device',
          keepAlive: false
        }
      },
      {
        path: 'product/detail',
        name: 'ProductDetail',
        component: "/device/product/detail",
        meta: {
          title: 'menus.device.productDetail',
          isHide: true,
          keepAlive: true,
          activePath: '/device/product' 
        }
      },
      {
        path: 'device/detail',
        name: 'DeviceDetail',
        component: "/device/device/detail",
        meta: {
          title: 'menus.device.deviceDetail',
          isHide: true,
          keepAlive: true,
          activePath: '/device/device' 
        }
      }
    ]
  }
  

