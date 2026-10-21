import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Product } from '@/lib/types'
import { getProduct } from '@/lib/services/productService'
import { notify } from '@/lib/notify'

export function useProductLookup() {
    const t = useTranslations()
    const [barcode, setBarcode] = useState('')
    const [product, setProduct] = useState<Product | null>(null)
    const [expiryDate, setExpiryDate] = useState('')
    const [searching, setSearching] = useState(false)
    const [added, setAdded] = useState(false)

    const search = useCallback(
        async (trimmedCode: string) => {
            if (searching) return
            setSearching(true)
            setProduct(null)
            setAdded(false)
            setExpiryDate('')
            setBarcode(trimmedCode)
            const isOffline =
                typeof navigator !== 'undefined' && !navigator.onLine

            try {
                const result = await getProduct(trimmedCode)
                if (result) {
                    setProduct(result)
                } else if (isOffline) {
                    notify.warning(t('scanner.errors.offline'))
                } else {
                    notify.error(t('scanner.errors.notFound'))
                    setBarcode(trimmedCode)
                }
            } catch (err) {
                console.error('Search error:', err)
                notify.error(t('scanner.errors.searchFailed'))
            } finally {
                setSearching(false)
            }
        },
        [searching, t]
    )

    return {
        barcode,
        setBarcode,
        product,
        setProduct,
        expiryDate,
        setExpiryDate,
        searching,
        added,
        setAdded,
        search,
    }
}
