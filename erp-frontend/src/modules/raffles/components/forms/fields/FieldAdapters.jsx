// PATH: erp-frontend/src/modules/raffles/components/forms/fields/FieldAdapters.jsx
import * as React from 'react';
import { Field } from 'react-final-form';
import { TextField, MenuItem, FormControlLabel, Switch } from '@mui/material';

/**
 * TextField adaptable (input y select)
 * - Acepta `validate`, `parse`, `format` para Final Form (se pasan a <Field/>)
 * - NO pasa `validate` a MUI TextField (evita warning de prop inválida)
 */
export function FFTextField({
  name,
  label,
  type = 'text',
  parse,
  format,
  validate,        // <<—— la tomamos aquí
  required,
  select = false,
  children,
  ...rest          // <<—— aquí ya NO viene `validate`
}) {
  return (
    <Field name={name} parse={parse} format={format} validate={validate}>
      {({ input, meta }) => (
        <TextField
          {...input}
          label={label}
          type={type}
          required={required}
          select={select}
          error={meta.touched && !!meta.error}
          helperText={meta.touched && meta.error ? meta.error : ' '}
          fullWidth
          {...rest}
        >
          {select ? children : null}
        </TextField>
      )}
    </Field>
  );
}

/**
 * Select basado en FFTextField
 */
export function FFSelect({ name, label, required, validate, children, ...rest }) {
  return (
    <FFTextField
      name={name}
      label={label}
      required={required}
      select
      validate={validate}   // <<—— se re-envía al Field a través de FFTextField
      {...rest}
    >
      {children}
    </FFTextField>
  );
}

/**
 * Switch booleano
 */
export function FFSwitch({ name, label, validate }) {
  return (
    <Field
      name={name}
      type="checkbox"
      parse={(v) => !!v}
      format={(v) => !!v}
      validate={validate}   // <<—— también soporta validación si un día la necesitas
    >
      {({ input }) => (
        <FormControlLabel
          control={
            <Switch
              checked={!!input.value}
              onChange={(e, checked) => input.onChange(checked)}
            />
          }
          label={label}
        />
      )}
    </Field>
  );
}

