"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripe = void 0;
/**
 * Configuración de la instancia de Stripe para la integración en la aplicación.
 * Utiliza la clave secreta de Stripe y especifica la versión de la API.
 *
 * @remarks
 * Asegúrate de que la versión de la API especificada sea compatible con las funciones que estás utilizando.
 * Consulta la documentación de la API de Stripe para obtener más detalles.
 */
var stripe_1 = __importDefault(require("stripe"));
exports.stripe = new stripe_1.default((_a = process.env.STRIPE_SECRET_KEY) !== null && _a !== void 0 ? _a : '', {
    apiVersion: '2024-04-10', // Versión de la API de Stripe utilizada en la aplicación
    typescript: true,
});
