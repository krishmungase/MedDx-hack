// All amounts in paise (smallest INR unit). Razorpay's API expects paise.
export const CONSULT_FEE_PAISE = 19900 // ₹199
export const PLATFORM_CUT_BPS = 2000 // 20.00% (basis points → divide by 10000)
export const CURRENCY = 'INR'

export const paiseToRupees = (paise) => (paise / 100).toFixed(2)

// Split a paid consultation amount into doctor + platform shares.
// Uses integer math on paise so no float drift on payouts.
export const splitFee = (totalPaise) => {
  const platformFee = Math.round((totalPaise * PLATFORM_CUT_BPS) / 10000)
  const doctorEarning = totalPaise - platformFee
  return { platformFee, doctorEarning }
}
