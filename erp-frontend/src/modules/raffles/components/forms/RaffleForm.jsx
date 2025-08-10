// PATH: erp-frontend/src/modules/raffles/components/forms/RaffleForm.jsx
import * as React from 'react';
import { Form } from 'react-final-form';
import { Box, Paper, Grid, Button, MenuItem } from '@mui/material';
import { FFTextField, FFSelect, FFSwitch } from '@/modules/raffles/components/forms/fields/FieldAdapters';
import FormSection from '@/modules/raffles/components/forms/FormSection';
import {
  STATUS,
  NUMBER_LENGTH,
  composeValidators,
  required,
  minLength,
  isPositiveNumber,
  isPositiveInt,
  oneOf,
  dateRequired,
  endDateGteStartDate,
  totalTicketsByLength,
} from '@/modules/raffles/utils/validation';
import '@/modules/raffles/styles/raffles-form.css';

const toNumber = (v) => (v === '' || v === undefined || v === null ? '' : Number(v));

export default function RaffleForm({ initialValues, onSubmit, onCancel }) {
  const defaults = {
    name: '',
    status: 'Borrador',
    price: '',
    totalTickets: '',
    numberLength: 4,
    startDate: '',
    endDate: '',
    prize: '',
    description: '',
    allowRandom: true,
    ...initialValues,
  };

  const validateForm = (values) => {
    const errors = {};
    if (!STATUS.includes(values.status)) errors.status = 'Estado inválido';
    return errors;
  };

  return (
    <Paper className="rf-form__paper">
      <Form
        onSubmit={(vals) => {
          const payload = {
            ...vals,
            price: Number(vals.price || 0),
            totalTickets: Number(vals.totalTickets || 0),
            numberLength: Number(vals.numberLength || 4),
          };
          onSubmit?.(payload);
        }}
        initialValues={defaults}
        validate={validateForm}
        subscription={{ submitting: true, pristine: true }}
        render={({ handleSubmit, submitting, pristine }) => (
          <Box component="form" onSubmit={handleSubmit} noValidate className="rf-form">
            {/* Sección 1: Información básica */}
            <FormSection title="Información básica" subtitle="Datos generales de la rifa">
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <FFTextField
                    name="name"
                    label="Nombre de la rifa"
                    required
                    autoComplete="off"
                    validate={composeValidators(required(), minLength(3))}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FFSelect
                    name="status"
                    label="Estado"
                    required
                    validate={composeValidators(required(), oneOf(STATUS))}
                  >
                    {STATUS.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </FFSelect>
                </Grid>
              </Grid>
            </FormSection>

            {/* Sección 2: Configuración de tiquetes */}
            <FormSection
              title="Configuración de tiquetes"
              subtitle="Define la longitud del número y la cantidad total disponible"
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FFSelect
                    name="numberLength"
                    label="Longitud de número"
                    required
                    parse={toNumber}
                    validate={composeValidators(required(), oneOf(NUMBER_LENGTH))}
                  >
                    {NUMBER_LENGTH.map((n) => (
                      <MenuItem key={n} value={n}>
                        {n} dígitos
                      </MenuItem>
                    ))}
                  </FFSelect>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FFTextField
                    name="totalTickets"
                    label="Total de tiquetes"
                    type="number"
                    required
                    inputProps={{ min: 1, step: 1 }}
                    parse={toNumber}
                    validate={composeValidators(isPositiveInt(), totalTicketsByLength)}
                  />
                </Grid>

                <Grid item xs={12} md={4} className="rf-grid__switch">
                  <FFSwitch name="allowRandom" label="Permitir números aleatorios disponibles" />
                </Grid>
              </Grid>
            </FormSection>

            {/* Sección 3: Fechas y precio */}
            <FormSection title="Fechas y precio" subtitle="Periodo de venta y valor por tiquete">
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FFTextField
                    name="price"
                    label="Precio por tiquete (COP)"
                    type="number"
                    required
                    inputProps={{ min: 0, step: 100 }}
                    parse={toNumber}
                    validate={composeValidators(isPositiveNumber())}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FFTextField
                    name="startDate"
                    label="Fecha de inicio"
                    type="date"
                    required
                    InputLabelProps={{ shrink: true }}
                    validate={dateRequired}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FFTextField
                    name="endDate"
                    label="Fecha de fin"
                    type="date"
                    required
                    InputLabelProps={{ shrink: true }}
                    validate={composeValidators(dateRequired, endDateGteStartDate)}
                  />
                </Grid>
              </Grid>
            </FormSection>

            {/* Sección 4: Contenido */}
            <FormSection title="Contenido" subtitle="Información visible para los compradores">
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FFTextField name="prize" label="Premio principal" autoComplete="off" />
                </Grid>
                <Grid item xs={12}>
                  <FFTextField name="description" label="Descripción" multiline minRows={4} />
                </Grid>
              </Grid>
            </FormSection>

            {/* Acciones */}
            <div className="rf-form__actions">
              <Button variant="outlined" onClick={() => onCancel?.()} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={submitting || pristine}>
                Guardar
              </Button>
            </div>
          </Box>
        )}
      />
    </Paper>
  );
}


