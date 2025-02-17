import {
    IconLayoutDashboard,
    IconUsers,
    IconSchool,
    IconBooks,
    IconUserCircle,
    IconSettings,
    IconCalendarEvent,
    IconClipboardText,
    IconChartBar,
    IconCertificate,
    IconBook2,
    IconBuilding,
    IconClock,
    IconDatabase,
    IconMap2,
    IconQrcode,
    IconUserCheck,
    IconCalendarTime,
    IconFileDescription,
    IconDownload,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
    {
        navlabel: true,
        subheader: "Master Data",
    },
    {
        id: uniqueId(),
        title: "Ekstrakurikuler",
        icon: IconCertificate,
        href: "/master/extracurricular",
    },
    {
        id: uniqueId(),
        title: "Tahun Pelajaran",
        icon: IconCalendarEvent,
        href: "/master/academic-year",
    },
    {
        id: uniqueId(),
        title: "Data Siswa",
        icon: IconUsers,
        href: "/master/students",
    },
    {
        id: uniqueId(),
        title: "Kelas",
        icon: IconSchool,
        href: "/master/classes",
    },
    {
        id: uniqueId(),
        title: "Jurusan",
        icon: IconBooks,
        href: "/master/majors",
    },
    {
        id: uniqueId(),
        title: "Data Guru",
        icon: IconUserCircle,
        href: "/master/teachers",
    },
    {
        id: uniqueId(),
        title: "Mutasi Siswa",
        icon: IconUsers,
        href: "/master/student-mutations",
    },

    {
        navlabel: true,
        subheader: "User Management",
    },
    {
        id: uniqueId(),
        title: "Roles",
        icon: IconSettings,
        href: "/users/roles",
        badge: {
            content: "5",
            color: "warning",
        },
    },
    {
        id: uniqueId(),
        title: "Users",
        icon: IconUsers,
        href: "/users/list",
    },

    {
        navlabel: true,
        subheader: "Akademik",
    },
    {
        id: uniqueId(),
        title: "Jurnal Guru",
        icon: IconBook2,
        href: "/academic/teacher-journal",
    },
    {
        id: uniqueId(),
        title: "Kegiatan Pembelajaran",
        icon: IconBooks,
        href: "/academic/learning-activities",
    },
    {
        id: uniqueId(),
        title: "Rekap Kehadiran",
        icon: IconClipboardText,
        href: "/academic/attendance",
    },
    {
        id: uniqueId(),
        title: "Penilaian",
        icon: IconChartBar,
        href: "/academic/assessment",
    },
    {
        id: uniqueId(),
        title: "Penilaian Siswa",
        icon: IconChartBar,
        href: "/academic/student-assessment",
        badge: {
            content: "0",
            color: "warning",
        },
    },
    {
        id: uniqueId(),
        title: "Jadwal Guru",
        icon: IconCalendarEvent,
        href: "/academic/teacher-schedule",
    },
    {
        id: uniqueId(),
        title: "Kegiatan Ekstrakurikuler",
        icon: IconCertificate,
        href: "/academic/extracurricular-activities",
    },

    {
        navlabel: true,
        subheader: "PKL Management",
    },
    {
        id: uniqueId(),
        title: "Data PKL",
        icon: IconDatabase,
        href: "/pkl/data",
    },
    {
        id: uniqueId(),
        title: "Jurnal PKL",
        icon: IconFileDescription,
        href: "/pkl/journal",
    },

    {
        navlabel: true,
        subheader: "Piket & Perizinan",
    },
    {
        id: uniqueId(),
        title: "Administrasi Guru Piket",
        icon: IconUserCheck,
        href: "/picket/admin",
    },

    {
        navlabel: true,
        subheader: "Dashboard",
    },
    {
        id: uniqueId(),
        title: "Rekap Presensi",
        icon: IconClipboardText,
        href: "/dashboard/attendance-summary",
    },

    {
        navlabel: true,
        subheader: "Attendance Management",
    },
    {
        id: uniqueId(),
        title: "QR Code",
        icon: IconQrcode,
        href: "/attendance/qr-code",
    },
    {
        id: uniqueId(),
        title: "Class Attendances",
        icon: IconClipboardText,
        href: "/attendance/class",
    },
    {
        id: uniqueId(),
        title: "Absensi Shalat Dzuhur",
        icon: IconCalendarTime,
        href: "/attendance/prayer",
    },
    {
        id: uniqueId(),
        title: "Location Map",
        icon: IconMap2,
        href: "/attendance/location",
    },
    {
        id: uniqueId(),
        title: "Schedules",
        icon: IconCalendarEvent,
        href: "/attendance/schedules",
    },
    {
        id: uniqueId(),
        title: "Attendances",
        icon: IconUserCheck,
        href: "/attendance/list",
    },
    {
        id: uniqueId(),
        title: "Leaves",
        icon: IconCalendarTime,
        href: "/attendance/leaves",
    },

    {
        navlabel: true,
        subheader: "Office Management",
    },
    {
        id: uniqueId(),
        title: "Offices",
        icon: IconBuilding,
        href: "/office/list",
    },
    {
        id: uniqueId(),
        title: "Shifts",
        icon: IconClock,
        href: "/office/shifts",
    },

    {
        navlabel: true,
        subheader: "Pengaturan",
    },
    {
        id: uniqueId(),
        title: "Backup & Restore",
        icon: IconDownload,
        href: "/settings/backup",
    },
];

export default Menuitems;
