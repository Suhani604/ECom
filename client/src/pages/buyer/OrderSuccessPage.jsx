import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { FiCheckCircle, FiPackage, FiArrowRight } from 'react-icons/fi'
import { getOrderByIdAPI } from '../../api/orderAPI.js'

export default function OrderSuccessPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [order, setOrder] = useState(null)
  const { t } = useTranslation()

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getOrderByIdAPI(id)
        setOrder(data.order)
      } catch(_) {}
    }
    load()
  }, [id])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8 text-center">

        {/* Success icon */}
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <FiCheckCircle className="text-green-500" size={40}/>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('orderPlaced')}</h1>
        <p className="text-gray-500 text-sm mb-6">
          {order?.paymentMethod === 'cod'
            ? t('orderPlacedCOD')
            : t('orderPlacedOnline')}
        </p>

        {/* Order ID */}
        <div className="bg-gray-50 rounded-xl p-4 mb-5">
          <p className="text-xs text-gray-400 mb-1">{t('orderId')}</p>
          <p className="font-mono text-sm font-semibold text-gray-700 break-all">{id}</p>
          {order && (
            <>
              <div className="h-px bg-gray-200 my-3"/>
              <div className="grid grid-cols-2 gap-3 text-sm text-left">
                <div>
                  <p className="text-xs text-gray-400">{t('price')}</p>
                  <p className="font-semibold text-gray-800">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t('paymentMethod')}</p>
                  <p className="font-semibold text-gray-800 capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Paid'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t('items')}</p>
                  <p className="font-semibold text-gray-800">{order.items?.length || 0} item(s)</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t('orderStatus')}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium capitalize">{order.status}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Status steps */}
        <div className="flex items-center justify-between mb-6 px-2">
          {[t('placed'), t('packed'), t('shipped'), t('delivered')].map((step, i) => (
            <div key={step} className="flex items-center">
              <div className={`flex flex-col items-center gap-1 ${i === 0 ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  ${i === 0 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {i === 0 ? '✓' : i+1}
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{step}</span>
              </div>
              {i < 3 && <div className="w-6 h-0.5 bg-gray-200 mb-4 mx-1"/>}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button onClick={() => navigate('/orders')}
            className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2">
            <FiPackage size={16}/> {t('trackMyOrder')}
          </button>
          <button onClick={() => navigate('/home')}
            className="w-full py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            {t('continueShopping')} <FiArrowRight size={16}/>
          </button>
        </div>
      </div>
    </div>
  )
}