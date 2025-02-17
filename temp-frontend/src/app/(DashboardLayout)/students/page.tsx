import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import StudentList from './components/StudentList';

const Students = () => {
    return (
        <PageContainer title="Students" description="Student Management">
            <Box>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <StudentList />
                    </Grid>
                </Grid>
            </Box>
        </PageContainer>
    );
};

export default Students;
