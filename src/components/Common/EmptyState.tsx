import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface EmptyStateProps {
  icon: SvgIconComponent;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        px: 2,
      }}
    >
      <Icon
        sx={{
          fontSize: 64,
          color: 'action.disabled',
          mb: 2,
        }}
      />
      
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      <Typography
        color="text.secondary"
        sx={{ maxWidth: 'sm', mb: actionText ? 3 : 0 }}
      >
        {description}
      </Typography>

      {actionText && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
};
