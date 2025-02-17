import React from "react";
import { Card, CardContent, Typography, Stack, Box } from "@mui/material";

type Props = {
  title: string;
  subtitle: string;
  icon?: string;
  action?: JSX.Element;
  footer?: JSX.Element;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
};

const DashboardCard = ({
  title,
  subtitle,
  icon,
  action,
  footer,
  color = 'primary'
}: Props) => {
  return (
    <Card 
      elevation={9}
      sx={{
        padding: 0,
        '&:hover': {
          transform: 'translateY(-4px)',
          transition: 'all 0.3s ease-in-out'
        }
      }}
    >
      <CardContent sx={{ p: "30px" }}>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Stack spacing={1}>
            <Typography 
              variant="h6" 
              color="textSecondary"
              sx={{ fontWeight: 500 }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h3"
              color={`${color}.main`}
              sx={{ fontWeight: 600 }}
            >
              {subtitle}
            </Typography>
          </Stack>
          {icon && (
            <Box
              sx={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${color}.light`,
                color: `${color}.main`,
                fontSize: '2rem'
              }}
            >
              {icon}
            </Box>
          )}
          {action && (
            <Box sx={{ ml: 'auto' }}>
              {action}
            </Box>
          )}
        </Stack>
        {footer && (
          <Box mt={3}>
            {footer}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
