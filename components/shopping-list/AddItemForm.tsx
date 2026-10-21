import { TooltipButton } from '@/components/feedback/TooltipButton'
import { Plus, ScanLine } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AddItemFormProps {
    newItem: string
    setNewItem: (value: string) => void
    onAdd: (e: React.SubmitEvent<HTMLFormElement>) => void
    onOpenScanner: () => void
}

export function AddItemForm({
    newItem,
    setNewItem,
    onAdd,
    onOpenScanner,
}: AddItemFormProps) {
    const t = useTranslations('shoppingList')

    return (
        <div className="flex gap-2">
            <form onSubmit={onAdd} className="flex-1 flex gap-2">
                <Input
                    placeholder={t('addPlaceholder')}
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    maxLength={15}
                    className="flex-1"
                />
                <Button type="submit" disabled={!newItem.trim()}>
                    <Plus size={20} />
                </Button>
            </form>
            <TooltipButton
                aria-label={t('scanTooltip')}
                variant="secondary"
                onClick={onOpenScanner}
                tooltip={t('scanTooltip')}
            >
                <ScanLine size={20} />
            </TooltipButton>
        </div>
    )
}
