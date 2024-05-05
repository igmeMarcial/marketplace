import express from 'express'
import { WebhookRequest } from './server'
import { stripe } from './lib/stripe'
import type Stripe from 'stripe'
import { getPayloadClient } from './get-payload'
import { Product } from './payload-types'
import { Resend } from 'resend'
import { ReceiptEmailHtml } from './components/emails/ReceiptEmail'

// Crea una instancia de la clase Resend con la clave de API proporcionada en la variable de entorno

const resend = new Resend(process.env.RESEND_API_KEY)

//función que maneja las solicitudes de webhook de Stripe
export const stripeWebhookHandler = async (
  req: express.Request, // La solicitud HTTP entrante de Express
  res: express.Response // La respuesta HTTP de Express
) => {
  // Convierte la solicitud en un objeto de tipo WebhookRequest
  const webhookRequest = req as any as WebhookRequest
    // Extrae el cuerpo crudo y la firma de la solicitud
  const body = webhookRequest.rawBody
  const signature = req.headers['stripe-signature'] || ''

  let event;
  try {
    // Construye el evento de webhook a partir del cuerpo crudo y la firma
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    return res
      .status(400)
      .send(
        `Webhook Error: ${
          err instanceof Error
            ? err.message
            : 'Unknown Error'
        }`
      )
  }
// Extrae la sesión de pago del objeto de datos del evento
  const session = event.data
    .object as Stripe.Checkout.Session
  // Verifica si la sesión de pago contiene metadatos de usuario y pedido
  if (
    !session?.metadata?.userId ||
    !session?.metadata?.orderId
  ) {
    return res
      .status(400)
      .send(`Webhook Error: No user present in metadata`)
  }
// Maneja el evento si es de tipo 'checkout.session.completed'
  if (event.type === 'checkout.session.completed') {
    // Obtiene el cliente de la base de datos
    const payload = await getPayloadClient()


// Busca al usuario asociado con la sesión de pago
    const { docs: users } = await payload.find({
      collection: 'users',
      where: {
        id: {
          equals: session.metadata.userId,
        },
      },
    })

    const [user] = users
// Obtiene el primer usuario encontrado
    if (!user)
      return res
        .status(404)
        .json({ error: 'No such user exists.' })
 // Busca el pedido asociado con la sesión de pago
    const { docs: orders } = await payload.find({
      collection: 'orders',
      depth: 2,
      where: {
        id: {
          equals: session.metadata.orderId,
        },
      },
    })
  
    const [order] = orders

    if (!order)
      return res
        .status(404)
        .json({ error: 'No such order exists.' })
// Actualiza el estado del pedido para indicar que ha sido pagado
    await payload.update({
      collection: 'orders',
      data: {
        _isPaid: true,
      },
      where: {
        id: {
          equals: session.metadata.orderId,
        },
      },
    })
 // Envía un recibo de correo electrónico al usuario con los detalles de la compra
    // send receipt
    try {
      const data = await resend.emails.send({
        from: 'igmeShop <igme.import@gmail.com>',
        to: [user.email],
        subject:
          '¡Gracias por tu orden! Este es tu recibo.',
        html: ReceiptEmailHtml({
          date: new Date(),
          email: user.email,
          orderId: session.metadata.orderId,
          products: order.products as Product[],
        }),
      })
      res.status(200).json({ data })
    } catch (error) {
      res.status(500).json({ error })
    }
  }
 // Envía una respuesta de éxito si no hay errores
  return res.status(200).send()
}
