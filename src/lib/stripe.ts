import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 9,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    features: ['1 channel', 'Basic analytics', 'OBS widget'],
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: ['5 channels', 'AI analysis', 'Custom widget', 'Discord alerts'],
  },
  agency: {
    name: 'Agency',
    price: 99,
    priceId: process.env.STRIPE_AGENCY_PRICE_ID!,
    features: ['Unlimited channels', 'Full API access', 'White label', 'Priority support'],
  },
}
