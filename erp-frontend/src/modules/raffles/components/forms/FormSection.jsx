// PATH: erp-frontend/src/modules/raffles/components/forms/FormSection.jsx
import * as React from 'react';
import { Stack, Typography, Divider } from '@mui/material';

export default function FormSection({ title, subtitle, children }) {
  return (
    <section className="rf-section">
      <Stack className="rf-section__header">
        <Typography variant="h6" className="rf-section__title">
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" className="rf-section__subtitle">
            {subtitle}
          </Typography>
        ) : null}
      </Stack>
      <Divider className="rf-section__divider" />
      <div className="rf-section__content">{children}</div>
    </section>
  );
}
