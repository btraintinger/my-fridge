export const dynamic = 'force-dynamic'

import { createActivityNotificationHandler } from '@/lib/server/activityNotification'

export const POST = createActivityNotificationHandler({
    type: 'fridge_activity',
    messagePrefix: 'fridgeActivity',
    tagPrefix: 'fridge-activity',
    logLabel: 'fridge-activity',
})
