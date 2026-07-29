import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { 
    ListTodoIcon,
    ClockIcon,
    CheckCircle2Icon,
    AlertTriangleIcon
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData, clearDashboardData } from '@/store/dashboardSlice';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Badge } from '@/components/ui/badge.jsx';

const ChartEmptyState = () => (
    <div className="h-64 flex flex-col items-center justify-center text-center p-4">
        <div className="mb-4 p-3 rounded-full bg-muted">
            <BarChart className="size-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">No tasks yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
            Create your first task to see analytics here.
        </p>
    </div>
);

const RecentTasksEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-4 p-3 rounded-full bg-muted">
            <ListTodoIcon className="size-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">No recent tasks</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
            You don't have any tasks yet. Create a new task to get started.
        </p>
    </div>
);

const Dashboard = () => {
    useEffect(() => {
        document.title = 'Dashboard';
    }, []);
    const dispatch = useDispatch();
    const { data, loading, error } = useSelector((state) => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboardData());
        
        // Cleanup on unmount
        return () => {
            dispatch(clearDashboardData());
        };
    }, [dispatch]);

    // Calculate summary card values
    const calculateSummaryData = () => {
        if (!data || data.length === 0) {
            return {
                total: 0,
                inProgress: 0,
                completed: 0,
                overdue: 0
            };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let total = 0;
        let inProgress = 0;
        let completed = 0;
        let overdue = 0;

        data.forEach(task => {
            total++;
            
            if (task.status === 'in-progress') {
                inProgress++;
            } else if (task.status === 'completed') {
                completed++;
            }
            
            // Check if task is overdue
            if (task.dueDate) {
                const dueDate = new Date(task.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                
                if (dueDate < today && task.status !== 'completed') {
                    overdue++;
                }
            }
        });

        return { total, inProgress, completed, overdue };
    };

    // Calculate chart data
    const calculateChartData = () => {
        if (!data || data.length === 0) {
            return [];
        }

        const statusCounts = {
            'todo': 0,
            'in-progress': 0,
            'completed': 0
        };

        data.forEach(task => {
            if (Object.prototype.hasOwnProperty.call(statusCounts, task.status)) {
                statusCounts[task.status]++;
            }
        });

        return [
            { name: 'Todo', tasks: statusCounts['todo'] },
            { name: 'In Progress', tasks: statusCounts['in-progress'] },
            { name: 'Completed', tasks: statusCounts['completed'] }
        ];
    };

    // Get most recent tasks
    const getMostRecentTasks = () => {
        if (!data || data.length === 0) {
            return [];
        }

        // Sort by createdAt or updatedAt in descending order (newest first)
        const sortedTasks = [...data].sort((a, b) => {
            const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(a.createdAt);
            const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(b.createdAt);
            return dateB - dateA;
        });

        // Return only the first 5 tasks
        return sortedTasks.slice(0, 5);
    };

    const summaryData = calculateSummaryData();
    const chartData = calculateChartData();
    const recentTasks = getMostRecentTasks();

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome to your TaskFlow dashboard. Here's an overview of your tasks and activities.
                    </p>
                </div>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, index) => (
                            <Card key={index}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <Skeleton className="h-4 w-24" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-16" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Chart Section */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">Task Analytics</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Task Progress</CardTitle>
                            <CardDescription>
                                Overview of your task completion rates
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center">
                                <Skeleton className="h-full w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Recent Tasks Section */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Latest Tasks</CardTitle>
                            <CardDescription>
                                Your most recent tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[...Array(5)].map((_, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome to your TaskFlow dashboard. Here's an overview of your tasks and activities.
                    </p>
                </div>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Overview</h2>
                    <Card>
                        <CardContent className="flex items-center justify-center p-8">
                            <div className="text-center">
                                <div className="text-destructive text-lg font-medium mb-2">Error loading data</div>
                                <p className="text-muted-foreground mb-4">{error}</p>
                                <button 
                                    onClick={() => dispatch(fetchDashboardData())}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                                >
                                    Retry
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Other sections remain the same */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">Task Analytics</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Task Progress</CardTitle>
                            <CardDescription>
                                Overview of your task completion rates
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center">
                                <div className="text-center text-muted-foreground">
                                    Chart will be implemented here
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Latest Tasks</CardTitle>
                            <CardDescription>
                                Your most recent tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[...Array(5)].map((_, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                                            <ListTodoIcon className="size-5 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-3/4 bg-muted rounded"></div>
                                            <div className="h-3 w-1/2 bg-muted rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        );
    }

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'No due date';
        
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // If date is today
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }
        
        // If date is tomorrow
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        }
        
        // Otherwise, format as MM/DD/YYYY
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    };

    // Get status badge variant
    const getStatusVariant = (status) => {
        switch (status) {
            case 'todo': return 'default';
            case 'in-progress': return 'secondary';
            case 'completed': return 'success';
            default: return 'default';
        }
    };

    // Get priority badge variant
    const getPriorityVariant = (priority) => {
        switch (priority) {
            case 'low': return 'secondary';
            case 'medium': return 'warning';
            case 'high': return 'destructive';
            default: return 'default';
        }
    };

    return (
        <>
            <div className="space-y-6">
                {/* Dashboard Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome to your TaskFlow dashboard. Here's an overview of your tasks and activities.
                    </p>
                </div>

                {/* Summary Cards Section */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Tasks
                                </CardTitle>
                                <ListTodoIcon className={`size-4 bg-blue-500 text-white p-1 rounded-full`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summaryData.total}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    In Progress
                                </CardTitle>
                                <ClockIcon className={`size-4 bg-yellow-500 text-white p-1 rounded-full`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summaryData.inProgress}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Completed
                                </CardTitle>
                                <CheckCircle2Icon className={`size-4 bg-green-500 text-white p-1 rounded-full`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summaryData.completed}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Overdue
                                </CardTitle>
                                <AlertTriangleIcon className={`size-4 bg-red-500 text-white p-1 rounded-full`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summaryData.overdue}</div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Chart Section */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">Task Analytics</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Task Progress</CardTitle>
                            <CardDescription>
                                Overview of your task completion rates
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {chartData.length === 0 ? (
                                <ChartEmptyState />
                            ) : (
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={chartData}
                                            margin={{
                                                top: 5,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="tasks" fill="#3b82f6" name="Tasks" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                {/* Recent Tasks Section */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Latest Tasks</CardTitle>
                            <CardDescription>
                                Your most recent tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentTasks.length === 0 ? (
                                <RecentTasksEmptyState />
                            ) : (
                                <div className="space-y-4">
                                    {recentTasks.map((task) => (
                                        <div key={task.id} className="flex items-start gap-3">
                                            <div className="mt-1 size-2 rounded-full bg-muted"></div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium truncate">{task.title}</h4>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <Badge variant={getStatusVariant(task.status)}>
                                                        {task.status.replace('-', ' ')}
                                                    </Badge>
                                                    <Badge variant={getPriorityVariant(task.priority)}>
                                                        {task.priority}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDate(task.dueDate)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </>
    );
};

export default Dashboard;
