import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

export const PLANS = {
  beta: {
    name: 'Accès Bêta',
    price: 4,
    priceId: process.env.STRIPE_BETA_PRICE_ID!,
    features: ['Widget OBS temps réel', 'Score de hype IA', 'Détection de toxicité', 'Accès à vie au prix bêta'],
  },
}
