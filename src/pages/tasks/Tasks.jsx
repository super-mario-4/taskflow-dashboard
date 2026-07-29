import React, { Fragment, useEffect, useCallback, useMemo, useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table.jsx';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination.jsx';
import {
    Search,
    Plus,
    Eye,
    Edit,
    Trash2,
    Calendar,
    Clock,
    List,
    Kanban,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
    getTasks,
    setSearch,
    setFilters,
    setView,
    setSort,
    setPage,
    createTask,
    updateTask,
    deleteTask,
} from '@/store/taskSlice';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.jsx';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field.jsx';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog.jsx';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs.jsx';
import SortableTaskCard from '@/components/kanban/SortableTaskCard';

// Import dnd-kit components
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// Debounce utility function
const useDebounce = (callback, delay) => {
    const debouncedRef = React.useRef();

    return useCallback(
        (...args) => {
            if (debouncedRef.current) {
                clearTimeout(debouncedRef.current);
            }
            debouncedRef.current = setTimeout(() => callback(...args), delay);
        },
        [callback, delay]
    );
};

// Pagination helper function
const getPaginationRange = (currentPage, totalPages) => {
    const range = [];

    // Always show first page
    if (totalPages > 0) {
        range.push(1);
    }

    // Show current page and adjacent pages
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    // Add ellipsis before current range if needed
    if (start > 2) {
        range.push('...');
    }

    // Add pages in the current range
    for (let i = start; i <= end; i++) {
        range.push(i);
    }

    // Add ellipsis after current range if needed
    if (end < totalPages - 1) {
        range.push('...');
    }

    // Always show last page
    if (totalPages > 1) {
        range.push(totalPages);
    }

    return range;
};

// Validation schema using Zod
const taskSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    status: z.enum(['todo', 'in-progress', 'completed'], 'Status is required'),
    priority: z.enum(['low', 'medium', 'high'], 'Priority is required'),
    dueDate: z.string().optional(),
});

const KanbanColumnDropZone = ({ column, tasks, children }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
        data: { type: 'Column', status: column.status },
    });

    return (
        <div ref={setNodeRef} className="flex flex-col h-full">
            <div
                className={`mb-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isOver ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-muted/50'
                }`}
            >
                {column.title}
                <span className="ml-2 bg-muted rounded-full px-2 py-0.5 text-xs">
                    {tasks.length}
                </span>
            </div>

            <div className="min-h-[100px] p-2 bg-muted/30 rounded-md flex-1">
                {children}
            </div>
        </div>
    );
};

const Tasks = () => {
    document.title = 'Tasks';
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { tasks, loading, error, search, filters, sort, pagination, view: selectedView } =
        useSelector((state) => state.tasks);

    // Track which task is currently being edited / deleted
    const [editingTask, setEditingTask] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const getPersistedView = () => {
        if (typeof window === 'undefined') return 'list';
        const persistedView = window.sessionStorage.getItem('tasks-view');
        return persistedView === 'kanban' ? 'kanban' : 'list';
    };

    const [view, setViewState] = useState(() => getPersistedView());

    // Drag and drop state
    const [activeTask, setActiveTask] = useState(null);
    const [tasksByStatus, setTasksByStatus] = useState({
        todo: [],
        'in-progress': [],
        completed: [],
    });

    // Fetch tasks when component mounts
    useEffect(() => {
        dispatch(getTasks());
    }, [dispatch]);

    useEffect(() => {
        const persistedView = getPersistedView();
        const nextView = persistedView || selectedView || 'list';

        if (nextView !== view) {
            setViewState(nextView);
        }
    }, [selectedView, view]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('tasks-view', view);
        }
    }, [view]);

    // Handle search input change with debouncing
    const handleSearchChange = useDebounce((value) => {
        dispatch(setSearch(value));
    }, 500);

    // Handle filter changes
    const handleFilterChange = (filterType, value) => {
        dispatch(
            setFilters({
                [filterType]: value,
            })
        );
    };

    // Handle sort changes
    const handleSortChange = (sortField) => {
        let newDirection = 'asc';

        if (sort.field === sortField && sort.direction === 'asc') {
            newDirection = 'desc';
        }

        dispatch(
            setSort({
                field: sortField,
                direction: newDirection,
            })
        );
    };

    // Handle page change
    const handlePageChange = (page) => {
        dispatch(setPage(page));
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'No due date';

        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Get status badge variant
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

    // Get priority badge variant
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

    // Sort tasks based on current sort settings
    const sortTasks = useCallback(
        (tasksToSort) => {
            return [...tasksToSort].sort((a, b) => {
                let aValue, bValue;

                switch (sort.field) {
                    case 'updatedAt':
                        aValue = new Date(a.updatedAt);
                        bValue = new Date(b.updatedAt);
                        break;
                    case 'dueDate':
                        aValue = a.dueDate ? new Date(a.dueDate) : null;
                        bValue = b.dueDate ? new Date(b.dueDate) : null;
                        // Put tasks without due date at the end
                        if (!aValue && !bValue) return 0;
                        if (!aValue) return 1;
                        if (!bValue) return -1;
                        break;
                    case 'priority': {
                        const priorityOrder = { high: 3, medium: 2, low: 1 };
                        aValue = priorityOrder[a.priority] || 0;
                        bValue = priorityOrder[b.priority] || 0;
                        break;
                    }
                    case 'title':
                        aValue = a.title.toLowerCase();
                        bValue = b.title.toLowerCase();
                        break;
                    default:
                        return 0;
                }

                if (sort.field === 'dueDate') {
                    // For due date, we want nearest first (ascending)
                    if (sort.direction === 'asc') {
                        return aValue - bValue;
                    } else {
                        return bValue - aValue;
                    }
                } else {
                    // For other fields, use normal sorting
                    if (sort.direction === 'asc') {
                        return aValue > bValue ? 1 : -1;
                    } else {
                        return aValue < bValue ? 1 : -1;
                    }
                }
            });
        },
        [sort]
    );

    // Filter tasks based on search term, status and priority
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            // Search filter
            const matchesSearch = task.title
                .toLowerCase()
                .includes(search.toLowerCase());

            // Status filter
            const matchesStatus =
                filters.status === '' || task.status === filters.status;

            // Priority filter
            const matchesPriority =
                filters.priority === '' || task.priority === filters.priority;

            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [tasks, search, filters]);

    // Sort filtered tasks
    const sortedTasks = useMemo(() => {
        return sortTasks(filteredTasks);
    }, [filteredTasks, sortTasks]);

    // Paginate tasks
    const paginatedTasks = useMemo(() => {
        const startIndex = (pagination.page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        return sortedTasks.slice(startIndex, endIndex);
    }, [sortedTasks, pagination.page, pagination.limit]);

    // Calculate total pages based on filtered and sorted tasks
    const totalPages = useMemo(() => {
        return Math.ceil(sortedTasks.length / pagination.limit);
    }, [sortedTasks.length, pagination.limit]);

    // Handle case when current page exceeds total pages
    useEffect(() => {
        if (pagination.page > totalPages && totalPages > 0) {
            dispatch(setPage(totalPages));
        } else if (totalPages === 0 && pagination.page !== 1) {
            dispatch(setPage(1));
        }
    }, [totalPages, pagination.page, dispatch]);

    // Update tasksByStatus when filteredTasks change
    useEffect(() => {
        const grouped = {
            todo: [],
            'in-progress': [],
            completed: [],
        };

        filteredTasks.forEach((task) => {
            if (Object.prototype.hasOwnProperty.call(grouped, task.status)) {
                grouped[task.status].push(task);
            }
        });

        setTasksByStatus(grouped);
    }, [filteredTasks]);

    // Form handling for create task
    const {
        register: registerCreate,
        handleSubmit: handleSubmitCreate,
        formState: { errors: errorsCreate },
        reset: resetCreate,
        setValue: setValueCreate,
        watch: watchCreate,
    } = useForm({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: '',
            description: '',
            status: 'todo',
            priority: 'medium',
            dueDate: '',
        },
    });

    // Form handling for edit task
    const {
        register: registerEdit,
        handleSubmit: handleSubmitEdit,
        formState: { errors: errorsEdit },
        reset: resetEdit,
        setValue: setValueEdit,
        watch: watchEdit,
    } = useForm({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: '',
            description: '',
            status: 'todo',
            priority: 'medium',
            dueDate: '',
        },
    });

    // Handle form submission for create task
    const onSubmitCreate = async (data) => {
        try {
            const resultAction = await dispatch(createTask(data));

            if (createTask.fulfilled.match(resultAction)) {
                resetCreate({
                    title: '',
                    description: '',
                    status: 'todo',
                    priority: 'medium',
                    dueDate: '',
                });
                setIsCreateDialogOpen(false);
            } else {
                console.error('Failed to create task:', resultAction.error);
            }
        } catch (err) {
            console.error('Error creating task:', err);
        }
    };

    // Handle form submission for edit task
    const onSubmitEdit = async (data) => {
        if (!editingTask) return;

        try {
            const resultAction = await dispatch(
                updateTask({ id: editingTask.id, taskData: data })
            );

            if (updateTask.fulfilled.match(resultAction)) {
                resetEdit();
                setIsEditDialogOpen(false);
                setEditingTask(null);
            } else {
                console.error('Failed to update task:', resultAction.error);
            }
        } catch (err) {
            console.error('Error updating task:', err);
        }
    };

    // Open edit dialog with task data
    const handleEditClick = (task) => {
        setEditingTask(task);
        setValueEdit('title', task.title);
        setValueEdit('description', task.description || '');
        setValueEdit('status', task.status);
        setValueEdit('priority', task.priority);
        setValueEdit('dueDate', task.dueDate || '');
        setIsEditDialogOpen(true);
    };

    // Handle view task
    const handleViewClick = (task) => {
        navigate(`/tasks/${task.id}`);
    };

    // Handle delete task
    const handleDeleteTask = async (taskId) => {
        try {
            const resultAction = await dispatch(deleteTask(taskId));

            if (deleteTask.fulfilled.match(resultAction)) {
                console.log('Task deleted successfully');
            } else {
                console.error('Failed to delete task:', resultAction.error);
            }
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    };

    // Handle dialog close
    const handleDialogClose = () => {
        resetCreate({
            title: '',
            description: '',
            status: 'todo',
            priority: 'medium',
            dueDate: '',
        });
        setIsCreateDialogOpen(false);
    };

    const handleEditDialogClose = () => {
        resetEdit();
        setIsEditDialogOpen(false);
        setEditingTask(null);
    };

    // Drag and drop handlers
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event) => {
        const { active } = event;
        const draggedTask = tasks.find((task) => task.id === active.id);
        setActiveTask(draggedTask || null);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        setActiveTask(null);

        if (!over) return;

        const draggedTask = tasks.find((task) => task.id === active.id);

        if (!draggedTask) return;

        const targetStatus = over.data?.current?.status || over.data?.current?.task?.status;

        if (!targetStatus || targetStatus === draggedTask.status) {
            return;
        }

        try {
            const resultAction = await dispatch(
                updateTask({
                    id: draggedTask.id,
                    taskData: {
                        status: targetStatus,
                        updatedAt: new Date().toISOString(),
                    },
                })
            );

            if (!updateTask.fulfilled.match(resultAction)) {
                console.error('Failed to update task status:', resultAction.error);
            }
        } catch (err) {
            console.error('Error updating task status:', err);
        }
    };

    // Kanban column configuration
    const kanbanColumns = [
        { id: 'todo', title: 'To Do', status: 'todo' },
        { id: 'in-progress', title: 'In Progress', status: 'in-progress' },
        { id: 'completed', title: 'Completed', status: 'completed' },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-muted-foreground">
                        Manage and track your tasks efficiently
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Task Management</CardTitle>
                        <CardDescription>
                            View, filter, and organize all your tasks in one
                            place
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Toolbar */}
                        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-col gap-2 md:flex-row md:gap-3">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search tasks..."
                                        className="pl-8"
                                        onChange={(e) =>
                                            handleSearchChange(e.target.value)
                                        }
                                    />
                                </div>

                                <Select
                                    value={filters.status}
                                    onValueChange={(value) =>
                                        handleFilterChange('status', value)
                                    }
                                >
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All</SelectItem>
                                        <SelectItem value="todo">
                                            To Do
                                        </SelectItem>
                                        <SelectItem value="in-progress">
                                            In Progress
                                        </SelectItem>
                                        <SelectItem value="completed">
                                            Completed
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.priority}
                                    onValueChange={(value) =>
                                        handleFilterChange('priority', value)
                                    }
                                >
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">
                                            Medium
                                        </SelectItem>
                                        <SelectItem value="high">
                                            High
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={sort.field}
                                    onValueChange={(value) =>
                                        handleSortChange(value)
                                    }
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="updatedAt">
                                            Newest First
                                        </SelectItem>
                                        <SelectItem value="dueDate">
                                            Due Date (Nearest)
                                        </SelectItem>
                                        <SelectItem value="priority">
                                            Priority (High to Low)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button className="w-full md:w-auto" disabled>
                                <Plus className="size-4 mr-2" />
                                Add Task
                            </Button>
                        </div>

                        {/* Skeleton Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Updated At</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...Array(5)].map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="size-2 rounded-full bg-muted"></div>
                                                    <div className="h-4 w-3/4 bg-muted rounded"></div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-6 w-16 bg-muted rounded"></div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-6 w-12 bg-muted rounded"></div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-4 w-20 bg-muted rounded"></div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-4 w-20 bg-muted rounded"></div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <div className="size-8 rounded-md bg-muted"></div>
                                                    <div className="size-8 rounded-md bg-muted"></div>
                                                    <div className="size-8 rounded-md bg-muted"></div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing 1 to {tasks.length} of {tasks.length}{' '}
                                results
                            </div>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious href="#" />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationLink href="#" isActive>
                                            1
                                        </PaginationLink>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationNext href="#" />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-muted-foreground">
                        Manage and track your tasks efficiently
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Task Management</CardTitle>
                        <CardDescription>
                            View, filter, and organize all your tasks in one
                            place
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center p-8">
                            <div className="text-center">
                                <div className="text-destructive text-lg font-medium mb-2">
                                    Error loading tasks
                                </div>
                                <p className="text-muted-foreground mb-4">
                                    {error}
                                </p>
                                <Button onClick={() => dispatch(getTasks())}>
                                    Retry
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                <p className="text-muted-foreground">
                    Manage and track your tasks efficiently
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Task Management</CardTitle>
                    <CardDescription>
                        View, filter, and organize all your tasks in one place
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs
                        value={view}
                        onValueChange={(nextValue) => {
                            setViewState(nextValue);
                            dispatch(setView(nextValue));
                            if (typeof window !== 'undefined') {
                                window.sessionStorage.setItem('tasks-view', nextValue);
                            }
                        }}
                        className="w-auto"
                    >
                        {/* Toolbar */}
                        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-col gap-2 md:flex-row md:gap-3">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search tasks..."
                                        className="pl-8"
                                        onChange={(e) =>
                                            handleSearchChange(e.target.value)
                                        }
                                    />
                                </div>

                                <Select
                                    value={filters.status}
                                    onValueChange={(value) =>
                                        handleFilterChange('status', value)
                                    }
                                >
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All</SelectItem>
                                        <SelectItem value="todo">
                                            To Do
                                        </SelectItem>
                                        <SelectItem value="in-progress">
                                            In Progress
                                        </SelectItem>
                                        <SelectItem value="completed">
                                            Completed
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.priority}
                                    onValueChange={(value) =>
                                        handleFilterChange('priority', value)
                                    }
                                >
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">
                                            Medium
                                        </SelectItem>
                                        <SelectItem value="high">
                                            High
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Only show sort in list view */}
                                {view === 'list' && (
                                    <Select
                                        value={sort.field}
                                        onValueChange={(value) =>
                                            handleSortChange(value)
                                        }
                                    >
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue placeholder="Sort by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="updatedAt">
                                                Newest First
                                            </SelectItem>
                                            <SelectItem value="dueDate">
                                                Due Date (Nearest)
                                            </SelectItem>
                                            <SelectItem value="priority">
                                                Priority (High to Low)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* View Switch Tabs */}
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger
                                    value="list"
                                    className="flex items-center gap-2"
                                >
                                    <List className="size-4" />
                                    List View
                                </TabsTrigger>
                                <TabsTrigger
                                    value="kanban"
                                    className="flex items-center gap-2"
                                >
                                    <Kanban className="size-4" />
                                    Kanban View
                                </TabsTrigger>
                            </TabsList>

                            {/* Add Task Dialog */}
                            <Button
                                className="w-full md:w-auto"
                                onClick={() => setIsCreateDialogOpen(true)}
                            >
                                <Plus className="size-4 mr-2" />
                                Add Task
                            </Button>
                            <Dialog
                                open={isCreateDialogOpen}
                                onOpenChange={(open) => {
                                    if (!open) {
                                        handleDialogClose();
                                        return;
                                    }
                                    setIsCreateDialogOpen(true);
                                }}
                            >
                                <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Add New Task</DialogTitle>
                                        <DialogDescription>
                                            Create a new task by filling in the
                                            details below.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form
                                        onSubmit={handleSubmitCreate(
                                            onSubmitCreate
                                        )}
                                        className="space-y-4"
                                    >
                                        <FieldGroup>
                                            <Field>
                                                <FieldLabel htmlFor="title">
                                                    Title
                                                </FieldLabel>
                                                <Input
                                                    id="title"
                                                    placeholder="Task title"
                                                    {...registerCreate('title')}
                                                    aria-invalid={
                                                        !!errorsCreate.title
                                                    }
                                                />
                                                {errorsCreate.title && (
                                                    <p className="mt-1 text-sm text-destructive">
                                                        {
                                                            errorsCreate.title
                                                                .message
                                                        }
                                                    </p>
                                                )}
                                            </Field>

                                            <Field>
                                                <FieldLabel htmlFor="description">
                                                    Description
                                                </FieldLabel>
                                                <Input
                                                    id="description"
                                                    placeholder="Task description"
                                                    {...registerCreate(
                                                        'description'
                                                    )}
                                                />
                                            </Field>

                                            <div className="grid grid-cols-2 gap-4">
                                                <Field>
                                                    <FieldLabel htmlFor="status">
                                                        Status
                                                    </FieldLabel>
                                                    <Select
                                                        value={watchCreate(
                                                            'status'
                                                        )}
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setValueCreate(
                                                                'status',
                                                                value
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="todo">
                                                                To Do
                                                            </SelectItem>
                                                            <SelectItem value="in-progress">
                                                                In Progress
                                                            </SelectItem>
                                                            <SelectItem value="completed">
                                                                Completed
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </Field>

                                                <Field>
                                                    <FieldLabel htmlFor="priority">
                                                        Priority
                                                    </FieldLabel>
                                                    <Select
                                                        value={watchCreate(
                                                            'priority'
                                                        )}
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setValueCreate(
                                                                'priority',
                                                                value
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select priority" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="low">
                                                                Low
                                                            </SelectItem>
                                                            <SelectItem value="medium">
                                                                Medium
                                                            </SelectItem>
                                                            <SelectItem value="high">
                                                                High
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </Field>
                                            </div>

                                            <Field>
                                                <FieldLabel htmlFor="dueDate">
                                                    Due Date
                                                </FieldLabel>
                                                <Input
                                                    id="dueDate"
                                                    type="date"
                                                    {...registerCreate(
                                                        'dueDate'
                                                    )}
                                                />
                                            </Field>
                                        </FieldGroup>
                                        <DialogFooter className="flex flex-col sm:flex-row gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleDialogClose}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit">
                                                Save Task
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* View Content */}
                        <TabsContent value="list" className="border-0 p-0">
                            {/* Task Table */}
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead>Updated At</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedTasks.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="h-24 text-center"
                                                >
                                                    <div className="flex flex-col items-center justify-center py-8">
                                                        <div className="mb-4 p-3 rounded-full bg-muted">
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
                                                                className="size-6 text-muted-foreground"
                                                            >
                                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
                                                                <polyline points="14 2 14 8 20 8" />
                                                                <line
                                                                    x1="16"
                                                                    y1="13"
                                                                    x2="8"
                                                                    y2="13"
                                                                />
                                                                <line
                                                                    x1="16"
                                                                    y1="17"
                                                                    x2="8"
                                                                    y2="17"
                                                                />
                                                                <polyline points="10 9 9 9 8 9" />
                                                            </svg>
                                                        </div>
                                                        <h3 className="text-lg font-medium mb-1">
                                                            No tasks found
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground max-w-xs">
                                                            Try adjusting your
                                                            search or filter
                                                            criteria.
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedTasks.map((task) => (
                                                <TableRow key={task.id}>
                                                    <TableCell className="font-medium">
                                                        {task.title}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={getStatusVariant(
                                                                task.status
                                                            )}
                                                        >
                                                            {task.status.replace(
                                                                '-',
                                                                ' '
                                                            )}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={getPriorityVariant(
                                                                task.priority
                                                            )}
                                                        >
                                                            {task.priority}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Calendar className="size-4 text-muted-foreground" />
                                                            {formatDate(
                                                                task.dueDate
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Clock className="size-4 text-muted-foreground" />
                                                            {formatDate(
                                                                task.updatedAt
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleViewClick(
                                                                        task
                                                                    )
                                                                }
                                                                title="View task"
                                                            >
                                                                <Eye className="size-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleEditClick(
                                                                        task
                                                                    )
                                                                }
                                                                title="Edit task"
                                                            >
                                                                <Edit className="size-4" />
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger
                                                                    render={
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            title="Delete task"
                                                                        />
                                                                    }
                                                                >
                                                                    <Trash2 className="size-4 text-destructive" />
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>
                                                                            Delete
                                                                            task?
                                                                        </AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This
                                                                            will
                                                                            permanently
                                                                            delete
                                                                            "
                                                                            {
                                                                                task.title
                                                                            }
                                                                            ".
                                                                            This
                                                                            action
                                                                            cannot
                                                                            be
                                                                            undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>
                                                                            Cancel
                                                                        </AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() =>
                                                                                handleDeleteTask(
                                                                                    task.id
                                                                                )
                                                                            }
                                                                        >
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Edit Task Dialog */}
                            <Dialog
                                open={isEditDialogOpen}
                                onOpenChange={setIsEditDialogOpen}
                            >
                                <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Edit Task</DialogTitle>
                                        <DialogDescription>
                                            Update the task details below.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form
                                        onSubmit={handleSubmitEdit(
                                            onSubmitEdit
                                        )}
                                        className="space-y-4"
                                    >
                                        <FieldGroup>
                                            <Field>
                                                <FieldLabel htmlFor="edit-title">
                                                    Title
                                                </FieldLabel>
                                                <Input
                                                    id="edit-title"
                                                    placeholder="Task title"
                                                    {...registerEdit('title')}
                                                    aria-invalid={
                                                        !!errorsEdit.title
                                                    }
                                                />
                                                {errorsEdit.title && (
                                                    <p className="mt-1 text-sm text-destructive">
                                                        {
                                                            errorsEdit.title
                                                                .message
                                                        }
                                                    </p>
                                                )}
                                            </Field>

                                            <Field>
                                                <FieldLabel htmlFor="edit-description">
                                                    Description
                                                </FieldLabel>
                                                <Input
                                                    id="edit-description"
                                                    placeholder="Task description"
                                                    {...registerEdit(
                                                        'description'
                                                    )}
                                                />
                                            </Field>

                                            <div className="grid grid-cols-2 gap-4">
                                                <Field>
                                                    <FieldLabel htmlFor="edit-status">
                                                        Status
                                                    </FieldLabel>
                                                    <Select
                                                        value={watchEdit(
                                                            'status'
                                                        )}
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setValueEdit(
                                                                'status',
                                                                value
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="todo">
                                                                To Do
                                                            </SelectItem>
                                                            <SelectItem value="in-progress">
                                                                In Progress
                                                            </SelectItem>
                                                            <SelectItem value="completed">
                                                                Completed
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </Field>

                                                <Field>
                                                    <FieldLabel htmlFor="edit-priority">
                                                        Priority
                                                    </FieldLabel>
                                                    <Select
                                                        value={watchEdit(
                                                            'priority'
                                                        )}
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setValueEdit(
                                                                'priority',
                                                                value
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select priority" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="low">
                                                                Low
                                                            </SelectItem>
                                                            <SelectItem value="medium">
                                                                Medium
                                                            </SelectItem>
                                                            <SelectItem value="high">
                                                                High
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </Field>
                                            </div>

                                            <Field>
                                                <FieldLabel htmlFor="edit-dueDate">
                                                    Due Date
                                                </FieldLabel>
                                                <Input
                                                    id="edit-dueDate"
                                                    type="date"
                                                    {...registerEdit('dueDate')}
                                                />
                                            </Field>
                                        </FieldGroup>
                                        <DialogFooter className="flex flex-col sm:flex-row gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleEditDialogClose}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit">
                                                Save Changes
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </TabsContent>

                        <TabsContent value="kanban" className="border-0 p-0">
                            {/* Dnd Context for Kanban */}
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCorners}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            >
                                {/* Kanban Board */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {kanbanColumns.map((column) => {
                                        const columnTasks = tasksByStatus[column.status] || [];

                                        return (
                                            <KanbanColumnDropZone
                                                key={column.id}
                                                column={column}
                                                tasks={columnTasks}
                                            >
                                                {columnTasks.length === 0 ? (
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
                                                            <rect
                                                                x="3"
                                                                y="3"
                                                                width="18"
                                                                height="18"
                                                                rx="2"
                                                                ry="2"
                                                            ></rect>
                                                            <line
                                                                x1="3"
                                                                y1="9"
                                                                x2="21"
                                                                y2="9"
                                                            ></line>
                                                            <line
                                                                x1="9"
                                                                y1="21"
                                                                x2="9"
                                                                y2="9"
                                                            ></line>
                                                        </svg>
                                                        <h3 className="text-lg font-medium mb-1">
                                                            No tasks
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground max-w-xs">
                                                            Add a task to this
                                                            column
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <SortableContext
                                                        items={columnTasks.map(
                                                            (task) => task.id
                                                        )}
                                                        strategy={
                                                            verticalListSortingStrategy
                                                        }
                                                    >
                                                        <div className="space-y-3">
                                                            {columnTasks.map((task) => (
                                                                <SortableTaskCard
                                                                    key={task.id}
                                                                    task={task}
                                                                />
                                                            ))}
                                                        </div>
                                                    </SortableContext>
                                                )}
                                            </KanbanColumnDropZone>
                                        );
                                    })}
                                </div>

                                {/* Drag Overlay */}
                                <DragOverlay>
                                    {activeTask ? (
                                        <Card className="border border-border/40 shadow-lg">
                                            <CardContent className="p-3">
                                                <h4 className="font-medium truncate">
                                                    {activeTask.title}
                                                </h4>
                                                <div className="mt-2 flex items-center justify-between">
                                                    <Badge
                                                        variant={getPriorityVariant(
                                                            activeTask.priority
                                                        )}
                                                    >
                                                        {activeTask.priority}
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
                                                            <rect
                                                                x="3"
                                                                y="4"
                                                                width="18"
                                                                height="18"
                                                                rx="2"
                                                                ry="2"
                                                            ></rect>
                                                            <line
                                                                x1="16"
                                                                y1="2"
                                                                x2="16"
                                                                y2="6"
                                                            ></line>
                                                            <line
                                                                x1="8"
                                                                y1="2"
                                                                x2="8"
                                                                y2="6"
                                                            ></line>
                                                            <line
                                                                x1="3"
                                                                y1="10"
                                                                x2="21"
                                                                y2="10"
                                                            ></line>
                                                        </svg>
                                                        {formatDate(activeTask.dueDate)}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ) : null}
                                </DragOverlay>
                            </DndContext>
                        </TabsContent>
                    </Tabs>

                    {/* Pagination - Only show in list view */}
                    {view === 'list' && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing{' '}
                                {pagination.page === 1
                                    ? 1
                                    : (pagination.page - 1) * pagination.limit +
                                      1}{' '}
                                to{' '}
                                {Math.min(
                                    pagination.page * pagination.limit,
                                    sortedTasks.length
                                )}{' '}
                                of {sortedTasks.length} results
                            </div>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (pagination.page > 1)
                                                    handlePageChange(
                                                        pagination.page - 1
                                                    );
                                            }}
                                            className={
                                                pagination.page === 1
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>

                                    {/* Generate pagination range */}
                                    {getPaginationRange(
                                        pagination.page,
                                        totalPages
                                    ).map((page, index) => (
                                        <Fragment key={index}>
                                            {page === '...' ? (
                                                <PaginationItem>
                                                    <PaginationLink
                                                        href="#"
                                                        className="cursor-default"
                                                        disabled
                                                    >
                                                        ...
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ) : (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handlePageChange(
                                                                page
                                                            );
                                                        }}
                                                        isActive={
                                                            pagination.page ===
                                                            page
                                                        }
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            )}
                                        </Fragment>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (
                                                    pagination.page < totalPages
                                                )
                                                    handlePageChange(
                                                        pagination.page + 1
                                                    );
                                            }}
                                            className={
                                                pagination.page === totalPages
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Tasks;
