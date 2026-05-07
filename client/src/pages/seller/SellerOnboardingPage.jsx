import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  FiBriefcase, FiFileText, FiCreditCard, FiMapPin, FiCheckCircle,
  FiUpload, FiAlertCircle,
} from 'react-icons/fi'

import {
  saveBusinessInfoAPI, saveGSTINAPI, saveBankDetailsAPI,
  savePickupAddressAPI, getSellerProfileAPI,
} from '../../api/sellerAPI.js'
import useAuthStore   from '../../context/useAuthStore.js'
import StepIndicator  from '../../components/common/StepIndicator.jsx'

const STEPS = [
  { label: 'Business' },
  { label: 'GSTIN'    },
  { label: 'Bank'     },
  { label: 'Pickup'   },
  { label: 'Done'     },
]

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
]

export default function SellerOnboardingPage() {
  const navigate          = useNavigate()
  const { user, updateUser } = useAuthStore()
  const [step,    setStep]    = useState(1)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  // Resume from where they left off
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getSellerProfileAPI()
        const s = data.user?.sellerDetails?.onboardingStep || 1
        // If already approved redirect to dashboard
        if (data.user?.sellerDetails?.approvalStatus === 'approved') {
          navigate('/seller/dashboard', { replace: true })
          return
        }
        setStep(Math.min(s, 5))
      } catch (_) {}
    }
    fetchProfile()
  }, [])

  // ── Step 1: Business Info ──────────────────────────────────────────────────
  const onBusinessInfo = async (form) => {
    setLoading(true)
    try {
      const { data } = await saveBusinessInfoAPI({
        businessName: form.businessName,
        businessType: form.businessType,
      })
      updateUser(data.user)
      toast.success('Business info saved!')
      setStep(2)
      reset()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setLoading(false) }
  }

  // ── Step 2: GSTIN ──────────────────────────────────────────────────────────
  const onGSTIN = async (form) => {
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('gstin', form.gstin)
      fd.append('pan', form.pan || '')
      if (form.gstCert?.[0]) fd.append('document', form.gstCert[0])

      const { data } = await saveGSTINAPI(fd)
      updateUser(data.user)
      toast.success('GSTIN details saved!')
      setStep(3)
      reset()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setLoading(false) }
  }

  // ── Step 3: Bank Details ───────────────────────────────────────────────────
  const onBank = async (form) => {
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('bankName',       form.bankName)
      fd.append('accountHolder',  form.accountHolder)
      fd.append('accountNumber',  form.accountNumber)
      fd.append('ifscCode',       form.ifscCode)
      if (form.cancelCheque?.[0]) fd.append('document', form.cancelCheque[0])

      const { data } = await saveBankDetailsAPI(fd)
      updateUser(data.user)
      toast.success('Bank details saved!')
      setStep(4)
      reset()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setLoading(false) }
  }

  // ── Step 4: Pickup Address ─────────────────────────────────────────────────
  const onPickup = async (form) => {
    setLoading(true)
    try {
      const { data } = await savePickupAddressAPI(form)
      updateUser(data.user)
      toast.success('Onboarding complete! Waiting for admin approval.')
      setStep(5)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setLoading(false) }
  }

  // ── File upload display helper ─────────────────────────────────────────────
  const FileUploadField = ({ id, label, hint, reg, err }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <label htmlFor={id}
        className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-all">
        <FiUpload className="text-gray-400" size={18}/>
        <span className="text-sm text-gray-500">{hint}</span>
      </label>
      <input id={id} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" {...reg}/>
      {err && <p className="text-xs text-red-500 mt-1">{err.message}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 p-4">
      <div className="max-w-xl mx-auto pt-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500 rounded-xl mb-3">
            <FiBriefcase className="text-white" size={22}/>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Seller Onboarding</h1>
          <p className="text-sm text-gray-500 mt-1">Complete your profile to start selling</p>
        </div>

        <StepIndicator steps={STEPS} current={step}/>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* ── STEP 1: BUSINESS INFO ── */}
          {step === 1 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <FiBriefcase className="text-orange-600" size={20}/>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Business Information</h2>
                  <p className="text-xs text-gray-500">Tell us about your business</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onBusinessInfo)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business / Brand Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register('businessName', { required: 'Business name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                    placeholder="e.g. Sharma Garments, FashionHub"
                    className="input-field"
                  />
                  {errors.businessName && <p className="text-xs text-red-500 mt-1">{errors.businessName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['individual','company','partnership'].map((type) => (
                      <label key={type}
                        className="flex flex-col items-center gap-1 p-3 border-2 rounded-xl cursor-pointer hover:border-orange-300 transition-all has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                        <input type="radio" value={type} {...register('businessType', { required: 'Select type' })} className="hidden"/>
                        <span className="text-lg">
                          {type === 'individual' ? '👤' : type === 'company' ? '🏢' : '🤝'}
                        </span>
                        <span className="text-xs font-medium text-gray-700 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                  {errors.businessType && <p className="text-xs text-red-500 mt-1">{errors.businessType.message}</p>}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-all active:scale-95">
                  {loading ? 'Saving...' : 'Save & Continue →'}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 2: GSTIN ── */}
          {step === 2 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FiFileText className="text-blue-600" size={20}/>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">GSTIN & Tax Details</h2>
                  <p className="text-xs text-gray-500">Required for invoicing and payouts</p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl mb-5">
                <FiAlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={16}/>
                <p className="text-xs text-blue-700">
                  GSTIN format: <strong>27AAPFU0939F1ZV</strong> — 15 characters. First 2 digits are state code (e.g. 27 = Maharashtra).
                </p>
              </div>

              <form onSubmit={handleSubmit(onGSTIN)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GSTIN Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register('gstin', {
                      required: 'GSTIN is required',
                      pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i, message: 'Invalid GSTIN format' }
                    })}
                    placeholder="27AAPFU0939F1ZV"
                    maxLength={15}
                    className="input-field uppercase"
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.gstin && <p className="text-xs text-red-500 mt-1">{errors.gstin.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                  <input
                    {...register('pan', {
                      pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, message: 'Invalid PAN format. Example: ABCDE1234F' }
                    })}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className="input-field uppercase"
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.pan && <p className="text-xs text-red-500 mt-1">{errors.pan.message}</p>}
                </div>

                <FileUploadField
                  id="gstCert"
                  label="GST Certificate (optional)"
                  hint="Upload JPG, PNG or PDF — max 10MB"
                  reg={register('gstCert')}
                  err={errors.gstCert}
                />

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-all">
                    ← Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-all active:scale-95">
                    {loading ? 'Saving...' : 'Save & Continue →'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── STEP 3: BANK DETAILS ── */}
          {step === 3 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <FiCreditCard className="text-green-600" size={20}/>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Bank Account Details</h2>
                  <p className="text-xs text-gray-500">Payments will be transferred here</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onBank)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register('bankName', { required: 'Bank name is required' })}
                    placeholder="e.g. State Bank of India, HDFC Bank"
                    className="input-field"
                  />
                  {errors.bankName && <p className="text-xs text-red-500 mt-1">{errors.bankName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Holder Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register('accountHolder', { required: 'Account holder name is required' })}
                    placeholder="Name as on bank account"
                    className="input-field"
                  />
                  {errors.accountHolder && <p className="text-xs text-red-500 mt-1">{errors.accountHolder.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register('accountNumber', {
                      required: 'Account number is required',
                      pattern: { value: /^\d{9,18}$/, message: '9 to 18 digit account number' }
                    })}
                    placeholder="Enter account number"
                    type="number"
                    className="input-field"
                  />
                  {errors.accountNumber && <p className="text-xs text-red-500 mt-1">{errors.accountNumber.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IFSC Code <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register('ifscCode', {
                      required: 'IFSC code is required',
                      pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/i, message: 'Invalid IFSC. Example: SBIN0001234' }
                    })}
                    placeholder="SBIN0001234"
                    maxLength={11}
                    className="input-field uppercase"
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.ifscCode && <p className="text-xs text-red-500 mt-1">{errors.ifscCode.message}</p>}
                </div>

                <FileUploadField
                  id="cancelCheque"
                  label="Cancelled Cheque (optional)"
                  hint="Upload JPG, PNG or PDF — max 10MB"
                  reg={register('cancelCheque')}
                  err={errors.cancelCheque}
                />

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)}
                    className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-all">
                    ← Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-all active:scale-95">
                    {loading ? 'Saving...' : 'Save & Continue →'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── STEP 4: PICKUP ADDRESS ── */}
          {step === 4 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                  <FiMapPin className="text-pink-600" size={20}/>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Pickup Address</h2>
                  <p className="text-xs text-gray-500">Delivery partner will collect from here</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onPickup)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register('line1', { required: 'Address line 1 is required' })}
                    placeholder="Shop no., building name, street"
                    className="input-field"
                  />
                  {errors.line1 && <p className="text-xs text-red-500 mt-1">{errors.line1.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                  <input
                    {...register('line2')}
                    placeholder="Area, landmark (optional)"
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register('city', { required: 'City is required' })}
                      placeholder="e.g. Pune"
                      className="input-field"
                    />
                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register('pincode', {
                        required: 'Pincode required',
                        pattern: { value: /^\d{6}$/, message: '6 digit pincode' }
                      })}
                      placeholder="411001"
                      maxLength={6}
                      className="input-field"
                    />
                    {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-400">*</span>
                  </label>
                  <select
                    {...register('state', { required: 'State is required' })}
                    className="input-field"
                  >
                    <option value="">Select state</option>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Contact Person at Pickup</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        {...register('contactName', { required: 'Contact name required' })}
                        placeholder="Person at warehouse"
                        className="input-field"
                      />
                      {errors.contactName && <p className="text-xs text-red-500 mt-1">{errors.contactName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone <span className="text-red-400">*</span>
                      </label>
                      <input
                        {...register('contactPhone', {
                          required: 'Phone required',
                          pattern: { value: /^[6-9]\d{9}$/, message: '10 digit mobile' }
                        })}
                        placeholder="9876543210"
                        maxLength={10}
                        className="input-field"
                      />
                      {errors.contactPhone && <p className="text-xs text-red-500 mt-1">{errors.contactPhone.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(3)}
                    className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-all">
                    ← Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-all active:scale-95">
                    {loading ? 'Saving...' : 'Complete Setup ✓'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── STEP 5: DONE ── */}
          {step === 5 && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <FiCheckCircle className="text-green-500" size={40}/>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Onboarding Complete!</h2>
              <p className="text-sm text-gray-500 mb-6">
                Your seller account is under review. Admin will approve within 24–48 hours.
                You'll get an email + notification when approved.
              </p>
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-left mb-6">
                <p className="text-sm font-semibold text-orange-700 mb-3">What happens next?</p>
                <div className="space-y-2">
                  {[
                    { icon: '🔍', text: 'Admin reviews your GSTIN & bank details' },
                    { icon: '✅', text: 'Account gets approved (24–48 hrs)' },
                    { icon: '📦', text: 'Start adding products to sell' },
                    { icon: '💰', text: 'Earn money on every sale!' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span>{item.icon}</span>
                      <span className="text-sm text-gray-600">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => navigate('/seller/dashboard')}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-all">
                Go to Dashboard
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}