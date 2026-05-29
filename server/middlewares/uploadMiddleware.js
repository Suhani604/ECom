import multer from 'multer'

// ✅ memoryStorage — no disk write, works on Vercel/Render
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPG, PNG, WEBP, PDF files allowed'), false)
  }
}

// default export — used by bannerRoutes as uploadMiddleware.single('image')
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })
export default upload

// named exports — used by sellerRoutes
export const uploadProductImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('images', 8)

export const uploadDocument = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('document')