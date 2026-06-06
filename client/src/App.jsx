import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import BuyerHomePage        from './pages/buyer/BuyerHomePage.jsx'
import LoginPage            from './pages/auth/LoginPage.jsx'
import ForgotPasswordPage   from './pages/auth/ForgotPasswordPage.jsx'
import ResetPasswordPage    from './pages/auth/ResetPasswordPage.jsx'
import BuyerSignupPage      from './pages/auth/BuyerSignupPage.jsx'
import SellerSignupPage     from './pages/auth/SellerSignupPage.jsx'
import SellerDashboard      from './pages/seller/SellerDashboard.jsx'
import SellerOnboardingPage from './pages/seller/SellerOnboardingPage.jsx'
import AddProductPage       from './pages/seller/AddProductPage.jsx'
import MyProductsPage       from './pages/seller/MyProductsPage.jsx'
import AdminDashboard       from './pages/admin/AdminDashboard.jsx'
import AdminSellersPage     from './pages/admin/AdminSellersPage.jsx'
import AdminProductsPage    from './pages/admin/AdminProductsPage.jsx'
import AdminBuyersPage      from './pages/admin/AdminBuyersPage.jsx'
import AdminOrdersPage      from './pages/admin/AdminOrdersPage.jsx'   // ← ADD
import ProductDetailPage    from './pages/buyer/ProductDetailPage.jsx'
import CartPage             from './pages/buyer/CartPage.jsx'
import CheckoutPage         from './pages/buyer/CheckoutPage.jsx'
import OrderSuccessPage     from './pages/buyer/OrderSuccessPage.jsx'
import MyOrdersPage         from './pages/buyer/MyOrdersPage.jsx'
import ProtectedRoute       from './components/common/ProtectedRoute.jsx'
import WishlistPage         from './pages/buyer/WishlistPage.jsx'
import ProfilePage          from './pages/buyer/ProfilePage.jsx'
import ImageBulkUploadPage  from './pages/seller/ImageBulkUploadPage.jsx'
import SellerProfilePage    from './pages/seller/SellerProfilePage.jsx'
import SellerAnalyticsPage  from './pages/seller/SellerAnalyticsPage.jsx'
import SellerOrdersPage     from './pages/seller/SellerOrdersPage.jsx'
import SellerLayout         from './pages/seller/SellerLayout.jsx'
import SellerQualityPage    from './pages/seller/SellerQualityPage'
import AddReviewPage        from './pages/buyer/AddReviewPage.jsx'
import AdminReviewsPage  from './pages/admin/AdminReviewsPage.jsx'
import SellerReviewsPage from './pages/seller/SellerReviewsPage.jsx'
import AdminBannersPage from './pages/admin/AdminBannersPage.jsx'
import AdminCategoryPage from './pages/admin/AdminCategoryPage.jsx'
import DeliveryProtectedRoute    from './components/common/DeliveryProtectedRoute.jsx'
import DeliveryLoginPage         from './pages/delivery/DeliveryLoginPage.jsx'
import DeliveryRegisterPage      from './pages/delivery/DeliveryRegisterPage.jsx'
import DeliveryDashboardPage     from './pages/delivery/DeliveryDashboardPage.jsx'
import DeliveryOrdersPage        from './pages/delivery/DeliveryOrdersPage.jsx'
import DeliveryOrderDetailPage   from './pages/delivery/DeliveryOrderDetailPage.jsx'
import DeliveryEarningsPage      from './pages/delivery/DeliveryEarningsPage.jsx'
import DeliveryProfilePage       from './pages/delivery/DeliveryProfilePage.jsx'
import AdminDeliveryPartnersPage from './pages/admin/AdminDeliveryPartnersPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>

        {/* ── Public ─────────────────────────────────────────────── */}
        <Route path="/"                element={<BuyerHomePage />} />
        <Route path="/home"            element={<BuyerHomePage />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />
        <Route path="/signup/buyer"    element={<BuyerSignupPage />} />
        <Route path="/signup/seller"   element={<SellerSignupPage />} />

        {/* ── Buyer protected ────────────────────────────────────── */}
       <Route path="/product/:id"
                                       element={<ProductDetailPage />} />    <Route path="/cart"
                                       element={<CartPage />} />             <Route path="/checkout"
                                       element={<CheckoutPage />} />         <Route path="/order-success/:id"
                                       element={<ProtectedRoute role="buyer"><OrderSuccessPage /></ProtectedRoute>} />
        <Route path="/orders"          element={<ProtectedRoute role="buyer"><MyOrdersPage /></ProtectedRoute>} />
        <Route path="/order/:id"       element={<ProtectedRoute role="buyer"><MyOrdersPage /></ProtectedRoute>} />
        <Route path="/wishlist"        element={<WishlistPage />} />
        <Route path="/profile"         element={<ProfilePage />} />
        <Route path="/review/:orderId/:productId"
          element={<ProtectedRoute role="buyer"><AddReviewPage /></ProtectedRoute>} />

        {/* ── Seller protected ───────────────────────────────────── */}
        <Route path="/seller/onboarding"
          element={<ProtectedRoute role="seller"><SellerOnboardingPage /></ProtectedRoute>} />
        <Route path="/seller/dashboard"
          element={<ProtectedRoute role="seller"><SellerDashboard /></ProtectedRoute>} />
        <Route path="/seller/products"
          element={<ProtectedRoute role="seller"><SellerLayout><MyProductsPage /></SellerLayout></ProtectedRoute>} />
        <Route path="/seller/products/add"
          element={<ProtectedRoute role="seller"><SellerLayout><AddProductPage /></SellerLayout></ProtectedRoute>} />
        <Route path="/seller/products/edit/:id"
          element={<ProtectedRoute role="seller"><SellerLayout><AddProductPage /></SellerLayout></ProtectedRoute>} />
        <Route path="/seller/images"
          element={<ProtectedRoute role="seller"><SellerLayout><ImageBulkUploadPage /></SellerLayout></ProtectedRoute>} />
        <Route path="/seller/profile"
          element={<ProtectedRoute role="seller"><SellerLayout><SellerProfilePage /></SellerLayout></ProtectedRoute>} />
        <Route path="/seller/analytics"
          element={<ProtectedRoute role="seller"><SellerLayout><SellerAnalyticsPage /></SellerLayout></ProtectedRoute>} />
        <Route path="/seller/orders"
          element={<ProtectedRoute role="seller"><SellerOrdersPage /></ProtectedRoute>} />
        <Route path="/seller/quality"
          element={<ProtectedRoute role="seller"><SellerLayout><SellerQualityPage /></SellerLayout></ProtectedRoute>} />
          
          <Route path="/seller/reviews" element={<ProtectedRoute role="seller"><SellerLayout> <SellerReviewsPage /></SellerLayout></ProtectedRoute>} />

        {/* ── Admin protected ────────────────────────────────────── */}
        <Route path="/admin/dashboard"
          element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/sellers"
          element={<ProtectedRoute role="admin"><AdminSellersPage /></ProtectedRoute>} />
        <Route path="/admin/products"
          element={<ProtectedRoute role="admin"><AdminProductsPage /></ProtectedRoute>} />
        <Route path="/admin/buyers"
          element={<ProtectedRoute role="admin"><AdminBuyersPage /></ProtectedRoute>} />
        <Route path="/admin/orders"
          element={<ProtectedRoute role="admin"><AdminOrdersPage /></ProtectedRoute>} />  {/* ← ADD */}
          <Route path="/admin/reviews"  element={<ProtectedRoute role="admin"><AdminReviewsPage /></ProtectedRoute>}  />
          // ...
        <Route path="/admin/banners" element={<ProtectedRoute role="admin"><AdminBannersPage /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute role="admin"><AdminCategoryPage /></ProtectedRoute>} />
        <Route path="/admin/delivery-partners"
  element={<ProtectedRoute role="admin"><AdminDeliveryPartnersPage /></ProtectedRoute>} />
              {/* ── Delivery Partner ───────────────────────────────────── */}
      <Route path="/delivery/login"    element={<DeliveryLoginPage />} />
      <Route path="/delivery/register" element={<DeliveryRegisterPage />} />
      <Route path="/delivery/dashboard"
        element={<DeliveryProtectedRoute><DeliveryDashboardPage /></DeliveryProtectedRoute>} />
      <Route path="/delivery/orders"
        element={<DeliveryProtectedRoute><DeliveryOrdersPage /></DeliveryProtectedRoute>} />
      <Route path="/delivery/orders/:id"
        element={<DeliveryProtectedRoute><DeliveryOrderDetailPage /></DeliveryProtectedRoute>} />
      <Route path="/delivery/earnings"
        element={<DeliveryProtectedRoute><DeliveryEarningsPage /></DeliveryProtectedRoute>} />
      <Route path="/delivery/profile"
        element={<DeliveryProtectedRoute><DeliveryProfilePage /></DeliveryProtectedRoute>} />
        

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}