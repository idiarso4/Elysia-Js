import {
  IconLayoutDashboard,
  IconUsers,
  IconCalendarEvent,
  IconClipboardText,
  IconReportAnalytics,
  IconMessage,
} from "@tabler/icons-react";

export const TeacherMenuItems = [
  {
    navlabel: true,
    subheader: "Home",
  },
  {
    id: 1,
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/teacher/dashboard",
  },
  {
    navlabel: true,
    subheader: "Teaching",
  },
  {
    id: 2,
    title: "My Classes",
    icon: IconUsers,
    href: "/teacher/classes",
  },
  {
    id: 3,
    title: "Schedule",
    icon: IconCalendarEvent,
    href: "/teacher/schedule",
  },
  {
    id: 4,
    title: "Assignments",
    icon: IconClipboardText,
    href: "/teacher/assignments",
  },
  {
    navlabel: true,
    subheader: "Management",
  },
  {
    id: 5,
    title: "Attendance",
    icon: IconClipboardText,
    href: "/teacher/attendance",
  },
  {
    id: 6,
    title: "Grades",
    icon: IconReportAnalytics,
    href: "/teacher/grades",
  },
  {
    navlabel: true,
    subheader: "Communication",
  },
  {
    id: 7,
    title: "Messages",
    icon: IconMessage,
    href: "/teacher/messages",
  },
];
