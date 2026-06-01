import fs from 'fs'

const filePath = './app/[locale]/fridges/[id]/page.tsx'
let content = fs.readFileSync(filePath, 'utf8')

// 1. Add FridgeView import
content = content.replace(
    `import { ProductDetailModal } from '@/components/fridge-details/ProductDetailModal'`,
    `import { ProductDetailModal } from '@/components/fridge-details/ProductDetailModal'\nimport { FridgeView } from '@/components/fridges/FridgeView'`
)

// 2. Remove CATEGORY_KEYWORDS
content = content.replace(/const CATEGORY_KEYWORDS: Record<string, string\[\]> = \{[\s\S]*?\}\n/, '')

// 3. Remove state and refs
content = content.replace(/const \[editingQuantityItemId[\s\S]*?const \[itemToDelete, setItemToDelete\] = useState<FridgeItem \| null>\(null\)/, `const [itemToDelete, setItemToDelete] = useState<FridgeItem | null>(null)`)

// 4. Remove sorting and filtering useMemos
content = content.replace(/useEffect\(\(\) => \{\n        localStorage\.setItem\('fridgeSortPreference', sortBy\)\n    \}, \[sortBy\]\)[\s\S]*?const isCategoryExpanded = \(cat: string\) => expandedCategories\[cat\]/, '')

// 5. Remove swipe and edit handlers
content = content.replace(/const startQuantityEdit = \(item: FridgeItem\) => \{[\s\S]*?setSelectedItem\(item\)\n    \}/, '')

// 6. Replace UI section
const uiRegex = /<div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">[\s\S]*?<\/div>\n                <\/div>\n            <\/div>/
const newUi = `<FridgeView
                        items={items}
                        onItemClick={setSelectedItem}
                        onDeleteRequest={setItemToDelete}
                        onQuantityChange={async (itemId, quantity) => {
                            const item = items.find((i) => i.id === itemId)
                            if (item) {
                                await updateItemQuantity(id, itemId, quantity, {
                                    grade: item.product?.nutriscore_grade,
                                    quantity: item.quantity ?? 1,
                                })
                            }
                        }}
                        onExpiryDateChange={async (itemId, date) => {
                            await updateItemExpiryDate(id, itemId, date)
                        }}
                    />
                </div>
            </div>`
content = content.replace(uiRegex, newUi)

// 7. Remove unused imports (Input, Select, Chevron, Trash2, ArrowUpDown, etc.)
// Not strictly necessary, but good practice. We'll leave them to avoid breaking anything else.

fs.writeFileSync(filePath, content, 'utf8')
console.log('Refactor completed successfully!')
