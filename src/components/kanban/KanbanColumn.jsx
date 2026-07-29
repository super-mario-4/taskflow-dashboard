import { DndContext, useSensor, useSensors, PointerSensor, KeyboardSensor, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useDispatch } from 'react-redux';
import { updateTask } from '@/store/taskSlice';
import SortableTaskCard from './SortableTaskCard';

const KanbanColumn = ({ column, tasks, status }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const dispatch = useDispatch();

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Determine the new status based on the column
      let newStatus = '';
      switch (column.title.toLowerCase()) {
        case 'todo':
          newStatus = 'todo';
          break;
        case 'in progress':
          newStatus = 'in-progress';
          break;
        case 'done':
          newStatus = 'completed';
          break;
        default:
          newStatus = status; // fallback to the column's status prop
      }
      
      // Dispatch updateTask thunk to update backend and Redux state
      dispatch(updateTask({
        id: active.id,
        taskData: { status: newStatus }
      }));
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-2 px-2 py-1.5 bg-muted/50 rounded-md text-sm font-medium">
        {column.title}
        <span className="ml-2 bg-muted rounded-full px-2 py-0.5 text-xs">
          {tasks.length}
        </span>
      </div>
      
      <div className="min-h-[100px] p-2 bg-muted/30 rounded-md">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-12 mx-auto mb-4 text-muted-foreground"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            <h3 className="text-lg font-medium mb-1">No tasks</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Add a task to this column
            </p>
          </div>
        ) : (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={tasks.map(task => task.id)} 
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {tasks.map((task) => (
                  <SortableTaskCard key={task.id} task={task} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
