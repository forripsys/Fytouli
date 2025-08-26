// InstructionsDialog.tsx
import { X } from 'lucide-react'

interface InstructionsDialogProps {
    isOpen: boolean
    onClose: () => void
}

const InstructionsDialog = ({ isOpen, onClose }: InstructionsDialogProps) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">How to Use Fytouli</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">🌱 Adding Plants</h3>
                        <p className="text-muted-foreground mb-2">
                            Click the "Add Plant" button to add a new plant to your collection. Fill in:
                        </p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                            <li>Basic information (name, species, location)</li>
                            <li>Care requirements (light, humidity, temperature)</li>
                            <li>Care schedule (watering and fertilizing frequency)</li>
                            <li>Optional image URL and notes</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">💧 Managing Care</h3>
                        <p className="text-muted-foreground mb-2">
                            Each plant card shows its current care status:
                        </p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                            <li><span className="text-red-500">Red indicators</span> mean the plant needs attention</li>
                            <li><span className="text-blue-500">Blue indicators</span> show the plant is on schedule</li>
                            <li>Click "Water" or "Fertilize" buttons to mark tasks as complete</li>
                            <li>The app automatically schedules the next care date</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">📅 Calendar View</h3>
                        <p className="text-muted-foreground mb-2">
                            The calendar shows your upcoming care tasks:
                        </p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                            <li>Hover over dates to see scheduled tasks</li>
                            <li>Click on a date to see detailed task information</li>
                            <li>Tasks are color-coded by type (watering/fertilizing)</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">🔧 Additional Features</h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                            <li>Edit plant details by clicking the leaf icon</li>
                            <li>Delete plants using the trash can icon</li>
                            <li>View detailed plant information by clicking on a plant card</li>
                            <li>Check the Schedules page for a complete overview of all tasks</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InstructionsDialog