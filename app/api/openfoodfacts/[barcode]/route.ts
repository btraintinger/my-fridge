import { NextResponse } from 'next/server'
import type { Product } from '@openfoodfacts/openfoodfacts-nodejs'
import { off, OFF_FIELDS } from '@/lib/server/openFoodFacts/client'
import { mapOffProduct } from '@/lib/server/openFoodFacts/mapProduct'
import {
    readFreshProductCache,
    writeProductCache,
} from '@/lib/server/openFoodFacts/productCache'

export async function GET(
    _request: Request,
    context: { params: Promise<{ barcode: string }> }
) {
    try {
        const { barcode } = await context.params
        const normalizedBarcode = barcode.trim()

        if (!/^\d{8,14}$/.test(normalizedBarcode)) {
            return NextResponse.json({ product: null }, { status: 400 })
        }

        const cached = await readFreshProductCache(normalizedBarcode)
        if (cached) {
            return NextResponse.json({ product: cached })
        }

        const { data, error } = await off.apiv2.client.GET(
            '/api/v2/product/{code}',
            {
                params: {
                    path: { code: normalizedBarcode },
                    query: { fields: OFF_FIELDS, lc: 'en' },
                },
            }
        )

        if (error) {
            const err = error as {
                status?: number
                status_verbose?: string
            }
            if (
                err?.status === 0 ||
                err?.status_verbose === 'product not found'
            ) {
                return NextResponse.json({ product: null })
            }
            console.error('Open Food Facts SDK error:', error)
            return NextResponse.json({ product: null }, { status: 502 })
        }

        if (
            !data ||
            data.status === 0 ||
            !('product' in data) ||
            !data.product
        ) {
            return NextResponse.json({ product: null })
        }

        const product = mapOffProduct(
            data.product as Product,
            normalizedBarcode
        )
        await writeProductCache(normalizedBarcode, product)
        return NextResponse.json({ product })
    } catch (error) {
        console.error('Open Food Facts proxy failed:', error)
        return NextResponse.json({ product: null }, { status: 502 })
    }
}
