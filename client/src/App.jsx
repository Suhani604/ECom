import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import BuyerHomePage        from './pages/buyer/BuyerHomePage.jsx'
import LoginPage            from './pages/auth/LoginPage.jsx'
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
import ProductDetailPage    from './pages/buyer/ProductDetailPage.jsx'
import CartPage             from './pages/buyer/CartPage.jsx'
import CheckoutPage         from './pages/buyer/CheckoutPage.jsx'
import OrderSuccessPage     from './pages/buyer/OrderSuccessPage.jsx'
import MyOrdersPage         from './pages/buyer/MyOrdersPage.jsx'
import ProtectedRoute       from './components/common/ProtectedRoute.jsx'
import WishlistPage from './pages/buyer/WishlistPage.jsx'
import ProfilePage  from './pages/buyer/ProfilePage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        {/* Public */}
        <Route path="/"              element={<BuyerHomePage />} />
        <Route path="/home"          element={<BuyerHomePage />} />
        <Route path="/login"         element={<LoginPage />} />
        <Route path="/signup/buyer"  element={<BuyerSignupPage />} />
        <Route path="/signup/seller" element={<SellerSignupPage />} />

        {/* Buyer protected */}
        <Route path="/product/:id"       element={<ProtectedRoute role="buyer"><ProductDetailPage /></ProtectedRoute>} />
        <Route path="/cart"              element={<ProtectedRoute role="buyer"><CartPage /></ProtectedRoute>} />
        <Route path="/checkout"          element={<ProtectedRoute role="buyer"><CheckoutPage /></ProtectedRoute>} />
        <Route path="/order-success/:id" element={<ProtectedRoute role="buyer"><OrderSuccessPage /></ProtectedRoute>} />
        <Route path="/orders"            element={<ProtectedRoute role="buyer"><MyOrdersPage /></ProtectedRoute>} />
         <Route path="/wishlist"         element={<WishlistPage />} />
         <Route path="/profile"  element={<ProfilePage />} /> 
        {/* Seller protected */}
        <Route path="/seller/dashboard"         element={<ProtectedRoute role="seller"><SellerDashboard /></ProtectedRoute>} />
        <Route path="/seller/onboarding"        element={<ProtectedRoute role="seller"><SellerOnboardingPage /></ProtectedRoute>} />
        <Route path="/seller/products"          element={<ProtectedRoute role="seller"><MyProductsPage /></ProtectedRoute>} />
        <Route path="/seller/products/add"      element={<ProtectedRoute role="seller"><AddProductPage /></ProtectedRoute>} />
        <Route path="/seller/products/edit/:id" element={<ProtectedRoute role="seller"><AddProductPage /></ProtectedRoute>} />

        {/* Admin protected */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/sellers"   element={<ProtectedRoute role="admin"><AdminSellersPage /></ProtectedRoute>} />
        <Route path="/admin/products"  element={<ProtectedRoute role="admin"><AdminProductsPage /></ProtectedRoute>} />
        <Route path="/admin/buyers"    element={<ProtectedRoute role="admin"><AdminBuyersPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}