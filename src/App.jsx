import { Routes, Route } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import Dashboard from './pages/Dashboard'
import OrderList from './pages/orders/OrderList'
import OrderDetail from './pages/orders/OrderDetail'
import ProductList from './pages/products/ProductList'
import CategoryList from './pages/products/CategoryList'
import CustomerList from './pages/customers/CustomerList'
import SubscriptionList from './pages/subscriptions/SubscriptionList'
import DeliveryManifest from './pages/deliveries/DeliveryManifest'
import CouponList from './pages/coupons/CouponList'
import AppSettings from './pages/content/AppSettings'
import ContactMessages from './pages/messages/ContactMessages'
import PincodeList from './pages/service-area/PincodeList'
import ComingSoon from './pages/ComingSoon'

export default function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* Dashboard */}
        <Route index element={<Dashboard />} />

        {/* Orders */}
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/:id" element={<OrderDetail />} />

        {/* Products */}
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ComingSoon title="Create Product" description="Product create form is being built" />} />
        <Route path="products/:id/edit" element={<ComingSoon title="Edit Product" description="Product edit form is being built" />} />
        <Route path="categories" element={<CategoryList />} />

        {/* Customers */}
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/:id" element={<ComingSoon title="Customer Detail" description="Customer detail page is being built" />} />

        {/* Subscriptions */}
        <Route path="subscriptions" element={<SubscriptionList />} />
        <Route path="subscriptions/:id" element={<ComingSoon title="Subscription Detail" description="Subscription detail page is being built" />} />
        <Route path="trial-packs" element={<ComingSoon title="Trial Packs" description="Trial pack management is being built" />} />

        {/* Deliveries */}
        <Route path="deliveries" element={<DeliveryManifest />} />

        {/* Coupons */}
        <Route path="coupons" element={<CouponList />} />
        <Route path="coupons/new" element={<ComingSoon title="Create Coupon" description="Coupon create form is being built" />} />
        <Route path="coupons/:id/edit" element={<ComingSoon title="Edit Coupon" description="Coupon edit form is being built" />} />

        {/* Content */}
        <Route path="banners" element={<ComingSoon title="Banners" description="Banner management is being built" />} />
        <Route path="notifications" element={<ComingSoon title="Notifications" description="Notification system is being built" />} />
        <Route path="settings" element={<AppSettings />} />

        {/* Service Area */}
        <Route path="pincodes" element={<PincodeList />} />
        <Route path="delivery-slots" element={<ComingSoon title="Delivery Slots" description="Delivery slot configuration is being built" />} />

        {/* Messages */}
        <Route path="messages" element={<ContactMessages />} />

        {/* Reports */}
        <Route path="reports/revenue" element={<ComingSoon title="Revenue Reports" description="Revenue analytics is being built" />} />
        <Route path="reports/products" element={<ComingSoon title="Product Reports" description="Product analytics is being built" />} />

        {/* 404 */}
        <Route path="*" element={<ComingSoon title="Page Not Found" description="The page you're looking for doesn't exist" />} />
      </Route>
    </Routes>
  )
}
