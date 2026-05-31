import type {
    FcmTokenDoc as FcmTokenDocType,
    Fridge as FridgeType,
    FridgeItem as FridgeItemType,
    NotificationDoc as NotificationDocType,
    NotificationPreferences as NotificationPreferencesType,
    Nutriments as NutrimentsType,
    Product as ProductType,
    ShoppingListItem as ShoppingListItemType,
    UserPreferences as UserPreferencesType,
} from './schemas'

export type Fridge = FridgeType
export type FridgeItem = FridgeItemType
export type Product = ProductType
export type ShoppingListItem = ShoppingListItemType
export type Nutriments = NutrimentsType
export type FcmTokenDoc = FcmTokenDocType
export type NotificationDoc = NotificationDocType
export type NotificationPreferences = NotificationPreferencesType
export type UserPreferences = UserPreferencesType & {
    notificationPreferences?: NotificationPreferences
}
