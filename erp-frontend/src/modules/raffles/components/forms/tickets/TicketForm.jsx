// PATH: erp-frontend/src/modules/raffles/components/forms/tickets/TicketForm.jsx
import * as React from "react";
import { Form } from "react-final-form";
import arrayMutators from "final-form-arrays";
import {
  Box,
  Paper,
  Stack,
  Button,
  MenuItem,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { FFTextField, FFSelect } from "@modules/raffles/components/forms/fields/FieldAdapters";
import NumberListEditor from "./NumberListEditor";
import { mockRaffles } from "@modules/raffles/data/mock";
import { required } from "@modules/raffles/utils/validation";
import "@modules/raffles/styles/tickets-form.css";

// Constantes UI / negocio
export const PAYMENT_TYPES = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
];

// Valores iniciales
const initial = {
  raffle_id: "",
  name: "",
  phone: "",
  payment_type: "efectivo",
  numbers: [],
};

// Validaciones mínimas (se complementan con reglas de negocio del mock)
const validateForm = (values, currentRaffle) => {
  const errors = {};
  if (required(values.raffle_id)) errors.raffle_id = required(values.raffle_id);
  if (required(values.name)) errors.name = required(values.name);
  if (required(values.phone)) errors.phone = required(values.phone);

  const maxCount = currentRaffle?.numbers_per_ticket ?? 1;
  const digits = currentRaffle?.dijits_per_number ?? 4;

  if (!values.numbers || values.numbers.length === 0) {
    errors.numbers = "Añade al menos un número";
  } else {
    if (values.numbers.length > maxCount) {
      errors.numbers = `Máximo ${maxCount} número(s) por tiquete`;
    }
    const bad = values.numbers.find((n) => !/^\d+$/.test(n) || n.length !== digits);
    if (bad) {
      errors.numbers = `Todos los números deben tener ${digits} dígitos`;
    }
  }
  return errors;
};

export default function TicketForm({
  onAddToCart,      // (ticketDraft) => void
  onConfirmPurchase // (ticketDraft) => void
}) {
  const [raffleId, setRaffleId] = React.useState("");
  const currentRaffle = React.useMemo(
    () => mockRaffles.find((r) => r.id === raffleId),
    [raffleId]
  );

  const digits = currentRaffle?.dijits_per_number ?? 4;
  const maxCount = currentRaffle?.numbers_per_ticket ?? 1;
  const excluded = currentRaffle?.excluded_numbers ?? [];

  return (
    <Form
      onSubmit={() => {}}
      initialValues={initial}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, values, form, errors }) => (
        <Box component="form" onSubmit={handleSubmit} className="rf-tickets__form">
          <Paper className="rf-section">
            <Typography variant="h6" className="rf-section__title">Datos de la rifa</Typography>
            <Divider className="rf-section__divider" />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FFSelect
                  name="raffle_id"
                  label="Rifa"
                  value={values.raffle_id}
                  onChange={(e) => {
                    setRaffleId(e.target.value);
                    form.change("raffle_id", e.target.value);
                    form.change("numbers", []); // reset dependientes
                  }}
                  validate={required}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">Seleccione una rifa…</MenuItem>
                  {mockRaffles.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.name}
                    </MenuItem>
                  ))}
                </FFSelect>
              </Grid>

              <Grid item xs={12} sm={3}>
                <FFTextField
                  name="dijits_preview"
                  label="Dígitos por número"
                  value={digits}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FFTextField
                  name="max_preview"
                  label="Números por tiquete"
                  value={maxCount}
                  disabled
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper className="rf-section">
            <Typography variant="h6" className="rf-section__title">Datos del comprador</Typography>
            <Divider className="rf-section__divider" />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FFTextField name="name" label="Nombre completo" validate={required} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FFTextField
                  name="phone"
                  label="Celular"
                  validate={required}
                  inputProps={{ inputMode: "numeric", pattern: "\\d*" }}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper className="rf-section">
            <Typography variant="h6" className="rf-section__title">Números del tiquete</Typography>
            <Divider className="rf-section__divider" />

            <NumberListEditor
              value={values.numbers}
              onChange={(list) => form.change("numbers", list)}
              digits={digits}
              maxCount={maxCount}
              excluded={excluded}
              helperText={
                errors.numbers
                  ? errors.numbers
                  : `Añade hasta ${maxCount} número(s) de ${digits} dígitos`
              }
            />
          </Paper>

          <Paper className="rf-section">
            <Typography variant="h6" className="rf-section__title">Pago</Typography>
            <Divider className="rf-section__divider" />

            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <FFSelect name="payment_type" label="Medio de pago">
                  {PAYMENT_TYPES.map((p) => (
                    <MenuItem key={p.value} value={p.value}>
                      {p.label}
                    </MenuItem>
                  ))}
                </FFSelect>
              </Grid>

              <Grid item xs={12} md={7}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  justifyContent="flex-end"
                  sx={{ mt: { xs: 1, sm: 0 } }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => {
                      const errs = validateForm(values, currentRaffle);
                      if (Object.keys(errs).length) {
                        Object.keys(errs).forEach((k) => form.blur(k));
                        return;
                      }
                      onAddToCart?.({
                        ...values,
                        status: "pending",
                      });
                    }}
                  >
                    Añadir a la compra
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      const errs = validateForm(values, currentRaffle);
                      if (Object.keys(errs).length) {
                        Object.keys(errs).forEach((k) => form.blur(k));
                        return;
                      }
                      onConfirmPurchase?.({
                        ...values,
                        status: "paid",
                      });
                    }}
                  >
                    Confirmar compra
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}
    />
  );
}

