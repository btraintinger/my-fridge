import { Plus, ScanLine } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

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
    return (
        <div className="flex gap-2">
            <form onSubmit={onAdd} className="flex-1 flex gap-2">
                <Input
                    placeholder="Add an item..."
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    className="flex-1"
                />
                <Button type="submit">
                    <Plus size={20} />
                </Button>
            </form>
            <Button
                variant="secondary"
                onClick={onOpenScanner}
                title="Scan product and move to fridge"
            >
                <ScanLine size={20} />
            </Button>
        </div>
    )
}
