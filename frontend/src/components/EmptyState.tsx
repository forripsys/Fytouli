// EmptyState.tsx
import { Link } from 'react-router-dom'
import { Leaf, Plus } from 'lucide-react'

const EmptyState = () => {
    return (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
            <Leaf className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No plants yet</h3>
            <p className="text-muted-foreground mb-6">Start by adding your first plant to track its care routine.</p>
            <Link
                to="/plants/add"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
                <Plus size={20} />
                <span>Add Your First Plant</span>
            </Link>
        </div>
    )
}

export default EmptyState