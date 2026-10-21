export const dynamic = 'force-dynamic'

import { createActivityNotificationHandler } from '@/lib/server/activityNotification'

export const POST = createActivityNotificationHandler({
    type: 'shopping_list_activity',
    messagePrefix: 'shoppingListActivity',
    tagPrefix: 'shopping-list',
    logLabel: 'shopping-list-activity',
})
