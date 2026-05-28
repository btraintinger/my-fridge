import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
    matcher: [
        '/((?!api|_next|__|sw\\.js|manifest\\.json|favicon\\.ico|icons|.*\\..*).*)',
    ],
}
