// =============================================
// 3) src/core/components/ui/KpiCard.jsx
// =============================================
import * as React from 'react';
import { Card, CardContent, Stack, Typography, Avatar, Chip } from '@mui/material';

export default function KpiCard({ icon, label, value, diff, color = 'primary' }) {
  const positive = typeof diff === 'number' && diff >= 0;
  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="overline" color="text.secondary">{label}</Typography>
            <Typography variant="h4">{value}</Typography>
            {typeof diff === 'number' && (
              <Chip size="small" label={`${positive ? '+' : ''}${diff}%`} color={positive ? 'success' : 'error'} sx={{ mt: 1, fontWeight: 600 }} />
            )}
          </Stack>
          {icon ? (
            <Avatar sx={{ bgcolor: (t) => t.palette[color].main, color: 'white', width: 48, height: 48 }}>
              {icon}
            </Avatar>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
