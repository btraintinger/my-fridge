import { useAuth } from '@/contexts/AuthContext'
import {
    subscribeToUserPreferences,
    updateUserPreferences,
} from '@/lib/services/userService'
import type { UserPreferences, DietaryPreferences } from '@/lib/types'
import { useFirebaseSubscription } from './useFirebaseSubscription'

export function useUserPreferences() {
    const { user } = useAuth()

    const { data: preferences, loading } =
        useFirebaseSubscription<UserPreferences | null>(
            (onData, onError) => {
                if (!user) return undefined
                return subscribeToUserPreferences(user.uid, onData, onError)
            },
            [user?.uid]
        )

    const updateDietaryPreferences = async (
        dietaryPreferences: Partial<DietaryPreferences>
    ) => {
        if (!user) return

        const newDietary = {
            ...(preferences?.dietaryPreferences || {}),
            ...dietaryPreferences,
        }

        await updateUserPreferences(user.uid, {
            dietaryPreferences: newDietary as DietaryPreferences,
        })
    }

    return {
        preferences,
        dietaryPreferences: preferences?.dietaryPreferences || {
            vegan: false,
            vegetarian: false,
            glutenFree: false,
            lactoseFree: false,
            nutFree: false,
            kosher: false,
            halal: false,
            diabetes: false,
            allergies: [],
        },
        loading,
        updateDietaryPreferences,
    }
}
