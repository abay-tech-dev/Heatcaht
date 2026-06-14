import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS } from '@/lib/stripe'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  const { plan } = await req.json()
  const planConfig = PLANS[plan as keyof typeof PLANS]
  if (!planConfig) {
    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
  }

  // Récupère ou crée le customer Stripe
  const { data: dbUser } = await supabaseAdmin
    .from('users')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  let customerId = dbUser?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: dbUser?.email ?? undefined,
      metadata: { user_id: user.id, twitch_username: user.twitch_username },
    })
    customerId = customer.id
    await supabaseAdmin
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/#pricing`,
    metadata: { user_id: user.id, plan },
  })

  return NextResponse.json({ url: session.url })
}
