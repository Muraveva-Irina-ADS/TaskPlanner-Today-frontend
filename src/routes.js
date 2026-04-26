import PublicPage from "./page/publicPage/PublicPage";
import Registration from "./page/reg/Registration";
import Auth from "./page/auth/Auth";
import Project from "./page/project/Project";
import Profile from "./page/profile/Profile";
import Users from "./page/users/Users";
import ProjectDetail from "./page/projectDetails/ProjectDetails";
import AllProjects from "./page/allProjects/AllProjects";
import TaskDetail from "./page/taskDetails/TaskDetails";
import Calendar from "./page/calendar/Calendar";
import HistoryToAdmin from "./page/historyToAdmin/HistoryToAdmin";
import Matrix from "./page/matrix/Matrix";
import CompleteTasks from "./page/completeTasks/CompleteTasks";
import Pomodoro from "./page/pomodoro/Pomodoro";
import StageDetail from "./page/stageDetails/StageDetails";
import AllTasks from "./page/allTasks/AllTasks";
import Statistic from "./page/statistic/Statistic";

export const notAuthRoutes = [
    {
        path: '/',
        Component: PublicPage
    },
    {
        path: '/login',
        Component: Auth
    },
    {
        path: '/registration',
        Component: Registration
    }
]

export const userRoutes = [
    {
        path: '/project',
        Component: Project
    },
    {
        path: '/profile',
        Component: Profile
    },
    {
        path: '/project/:id',
        Component: ProjectDetail
    },
    {
        path: '/project/:id/task/:taskId',
        Component: TaskDetail
    },
    {
        path: '/calendar',
        Component: Calendar
    },
    {
        path: '/matrix',
        Component: Matrix
    },
    {
        path: '/complete',
        Component: CompleteTasks
    }, 
    {
        path: '/pomodoro',
        Component: Pomodoro
    },
    {
        path: '/project/:id/task/:taskId/stage/:stageId',
        Component: StageDetail
    },
    {
        path: '/statistic',
        Component: Statistic
    }

]

export const adminRoutes = [
    {
        path: '/project',
        Component: Project
    },
    {
        path: '/profile',
        Component: Profile
    }, 
    {
        path: '/users',
        Component: Users
    },
    {
        path: '/project/:id',
        Component: ProjectDetail
    },
    {
        path: '/all-projects',
        Component: AllProjects
    },
    {
        path: '/all-tasks',
        Component: AllTasks
    },
    {
        path: '/project/:id/task/:taskId',
        Component: TaskDetail
    },
    {
        path: '/calendar',
        Component: Calendar
    },
    {
        path: '/history',
        Component: HistoryToAdmin
    },
    {
        path: '/matrix',
        Component: Matrix
    }, 
    {
        path: '/complete',
        Component: CompleteTasks
    }, 
    {
        path: '/pomodoro',
        Component: Pomodoro
    },
    {
        path: '/project/:id/task/:taskId/stage/:stageId',
        Component: StageDetail
    },
    {
        path: '/statistic',
        Component: Statistic
    }
]
