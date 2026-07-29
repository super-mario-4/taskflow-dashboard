import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { getTaskById, clearSelectedTask } from '@/store/taskSlice';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { ArrowLeftIcon, Calendar, Clock } from 'lucide-react';

const TaskDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { selectedTask, loading, error } = useSelector(
        (state) => state.tasks
    );

    useEffect(() => {
        // Fetch task details when component mounts
        if (id) {
            dispatch(getTaskById(id));
        }

        // Cleanup when component unmounts
        return () => {
            dispatch(clearSelectedTask());
        };
    }, [dispatch, id]);

    const formatDate = (dateString) => {
        if (!dateString) return 'No date';

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

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeftIcon className="size-4 mr-2" />
                        Back to Tasks
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Task Details</CardTitle>
                        <CardDescription>
                            Loading task details...
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-32" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Skeleton className="h-4 w-20 mb-2" />
                                    <Skeleton className="h-8 w-full" />
                                </div>

                                <div>
                                    <Skeleton className="h-4 w-20 mb-2" />
                                    <Skeleton className="h-8 w-full" />
                                </div>

                                <div>
                                    <Skeleton className="h-4 w-20 mb-2" />
                                    <Skeleton className="h-8 w-full" />
                                </div>

                                <div>
                                    <Skeleton className="h-4 w-20 mb-2" />
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            </div>

                            <div>
                                <Skeleton className="h-4 w-20 mb-2" />
                                <Skeleton className="h-32 w-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeftIcon className="size-4 mr-2" />
                        Back to Tasks
                    </Button>
                </div>

                <Card>
                    <CardContent className="flex items-center justify-center p-8">
                        <div className="text-center">
                            <div className="text-destructive text-lg font-medium mb-2">
                                Error loading task
                            </div>
                            <p className="text-muted-foreground mb-4">
                                {error}
                            </p>
                            <Button onClick={() => dispatch(getTaskById(id))}>
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!selectedTask) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeftIcon className="size-4 mr-2" />
                        Back to Tasks
                    </Button>
                </div>

                <Card>
                    <CardContent className="flex items-center justify-center p-8">
                        <div className="text-center">
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
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium mb-1">
                                Task not found
                            </h3>
                            <p className="text-muted-foreground max-w-xs">
                                The task you're looking for doesn't exist or has
                                been deleted.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                    <ArrowLeftIcon className="size-4 mr-2" />
                    Back to Tasks
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Task Details</CardTitle>
                    <CardDescription>{selectedTask.title}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                    Status
                                </h3>
                                <Badge
                                    variant={getStatusVariant(
                                        selectedTask.status
                                    )}
                                >
                                    {selectedTask.status.replace('-', ' ')}
                                </Badge>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                    Priority
                                </h3>
                                <Badge
                                    variant={getPriorityVariant(
                                        selectedTask.priority
                                    )}
                                >
                                    {selectedTask.priority}
                                </Badge>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                    Due Date
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Calendar className="size-4 text-muted-foreground" />
                                    {formatDate(selectedTask.dueDate)}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                    Updated At
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Clock className="size-4 text-muted-foreground" />
                                    {formatDate(selectedTask.updatedAt)}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                Description
                            </h3>
                            <p className="text-foreground">
                                {selectedTask.description ||
                                    'No description provided'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TaskDetail;
