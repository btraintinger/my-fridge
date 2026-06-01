import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { subscribeToUserPreferences, updateUserPreferences } from '@/lib/services/userService'
import type { UserPreferences, DietaryPreferences } from '@/lib/types'

export function useUserPreferences() {
    const { user } = useAuth()
    const [preferences, setPreferences] = useState<UserPreferences | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            setPreferences(null)
            setLoading(false)
            return
        }

        const unsubscribe = subscribeToUserPreferences(
            user.uid,
            (prefs) => {
                setPreferences(prefs)
                setLoading(false)
            },
            (error) => {
                console.error('Error fetching user preferences:', error)
                setLoading(false)
            }
        )

        return () => unsubscribe()
    }, [user])

    const updateDietaryPreferences = async (dietaryPreferences: Partial<DietaryPreferences>) => {
        if (!user) return

        const newDietary = {
            ...(preferences?.dietaryPreferences || {}),
            ...dietaryPreferences,
        }

        await updateUserPreferences(user.uid, { dietaryPreferences: newDietary as DietaryPreferences })
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
