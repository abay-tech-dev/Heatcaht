import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const user_id = session.metadata?.user_id
    const plan = session.metadata?.plan
    if (user_id && plan) {
      await supabaseAdmin
        .from('users')
        .update({ plan })
        .eq('id', user_id)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const { data } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('stripe_customer_id', sub.customer)
      .single()
    if (data) {
      await supabaseAdmin
        .from('users')
        .update({ plan: 'free' })
        .eq('id', data.id)
    }
  }

  return NextResponse.json({ received: true })
}
