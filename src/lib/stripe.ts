/**
 * Configuración de la instancia de Stripe para la integración en la aplicación.
 * Utiliza la clave secreta de Stripe y especifica la versión de la API.
 * 
 * @remarks
 * Asegúrate de que la versión de la API especificada sea compatible con las funciones que estás utilizando.
 * Consulta la documentación de la API de Stripe para obtener más detalles.
 */
import Stripe from 'stripe'

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? '',
  {
    apiVersion: '2024-04-10',// Versión de la API de Stripe utilizada en la aplicación
    typescript: true,
  }
)
