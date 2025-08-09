// =============================================
// 2) src/core/components/ui/PageHeader.jsx
// =============================================
import * as React from 'react';
import { Stack, Typography, Breadcrumbs, Link, Box } from '@mui/material';

export default function PageHeader({ title, subtitle, breadcrumbs, actions }) {
  return (
    <Stack spacing={2} sx={{ mb: 3 }}>
      {breadcrumbs?.length ? (
        <Breadcrumbs separator="/">
          {breadcrumbs.map((bc, i) => (
            <Link key={i} color={i === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'} underline={i === breadcrumbs.length - 1 ? 'none' : 'hover'} href={bc.href || '#'}>
              {bc.label}
            </Link>
          ))}
        </Breadcrumbs>
      ) : null}

      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" gap={2}>
        <Box>
          <Typography variant="h3" gutterBottom>{title}</Typography>
          {subtitle ? <Typography variant="subtitle1">{subtitle}</Typography> : null}
        </Box>
        {actions ? <Box>{actions}</Box> : null}
      </Stack>
    </Stack>
  );
}