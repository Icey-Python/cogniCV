import jwt from 'jsonwebtoken'
import { Resend } from 'resend'
import { ENV } from './environments'
import type { WsMessageDataType } from '../types'
import { getWelcomeEmail } from './emailTemplates'

type PayloadType = {
	payload: string
	expiresIn: number | '1h' | '1d' | '7d' | '14d' | '30d' | number
}

type ResultType = {
	status: 'success' | 'error'
	message: string
	data: any
}

// Sign JWT token
export const signJwtToken = (payload: PayloadType): ResultType => {
	try {
		let result = jwt.sign({ token: payload.payload }, ENV.JWT_SECRET, {
			expiresIn: payload.expiresIn
		})

		return {
			status: 'success',
			message: 'Token created successfully',
			data: { token: result }
		}
	} catch (error) {
		return {
			status: 'error',
			message: 'Token could not be created',
			data: null
		}
	}
}

// Verify JWT token
export const verifyJwtToken = (token: string): ResultType => {
	try {
		let result = jwt.verify(token, ENV.JWT_SECRET)
		return {
			status: 'success',
			message: 'Token verified successfully',
			data: result
		}
	} catch (error) {
		return {
			status: 'error',
			message: 'Token could not be verified',
			data: null
		}
	}
}

// Object to json string
export const objToJson = (obj: WsMessageDataType): string =>
  JSON.stringify(obj, null, 2)

// Json string to object
export const jsonToObj = (json: string): WsMessageDataType => JSON.parse(json)

// Resend email
const resend = new Resend(ENV.RESEND_KEY || 're_123')

interface SendEmailProps {
	message: string
	subject: string
	url: string
	btnLabel: string
	email: string
}
export const sendEmail = async ({
	message,
	url,
	btnLabel,
	email,
	subject
}: SendEmailProps): Promise<boolean> => {
	const { data, error } = await resend.emails.send({
		from: 'Acme <onboarding@resend.dev>',
		to: [email],
		subject: subject,
		html: getWelcomeEmail({ message, url, btnLabel })
	})

	if (error) {
		console.error(error)
		return false
	}

	console.log(data)
	return true
}
