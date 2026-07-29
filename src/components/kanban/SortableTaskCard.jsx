import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableTaskCard = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'Task', task, status: task.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'todo':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'low':
        return 'secondary';
      case 'medium':
        return 'warning';
      case 'high':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className="border border-border/40 shadow-sm hover:shadow-md transition-shadow cursor-grab"
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3">
        <h4 className="font-medium truncate">{task.title}</h4>
        <div className="mt-2 flex items-center justify-between">
          <Badge variant={getPriorityVariant(task.priority)}>
            {task.priority}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {formatDate(task.dueDate)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SortableTaskCard;
