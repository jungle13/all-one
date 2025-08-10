// PATH: erp-frontend/src/modules/raffles/components/forms/tickets/NumberListEditor.jsx
import * as React from "react";
import {
  Box,
  Stack,
  TextField,
  Button,
  Chip,
  FormHelperText,
  Typography,
} from "@mui/material";

/**
 * Editor de lista de números para un tiquete.
 * - Enforcea longitud por dígitos (digits)
 * - Evita duplicados y números excluidos
 * - Respeta máximo (maxCount)
 * - Sincroniza su estado con el padre vía onChange(numbers[])
 */
export default function NumberListEditor({
  value = [],
  onChange,
  digits = 4,
  maxCount = 1,
  excluded = [],
  disabled = false,
  label = "Número",
  helperText,
}) {
  const [input, setInput] = React.useState("");

  const norm = (v) => (v ?? "").toString().trim();
  const pad = (v) => v.toString().padStart(digits, "0");
  const isFull = value.length >= maxCount;

  const addNumber = () => {
    if (disabled || !onChange) return;
    const raw = norm(input);
    if (!raw) return;

    // normaliza a dígitos exactos, y valida
    const onlyDigits = raw.replace(/\D+/g, "");
    if (!onlyDigits) return;

    const padded = pad(onlyDigits.slice(-digits));
    if (padded.length !== digits) return;

    if (excluded?.includes(padded)) return; // excluido
    if (value.includes(padded)) return;     // duplicado
    if (value.length >= maxCount) return;   // límite

    onChange([...value, padded]);
    setInput("");
  };

  const removeAt = (n) => {
    if (disabled || !onChange) return;
    onChange(value.filter((x) => x !== n));
  };

  const addRandom = () => {
    if (disabled || !onChange || isFull) return;
    let tries = 0;
    while (tries < 50) {
      const candidate = pad(Math.floor(Math.random() * 10 ** digits));
      if (!value.includes(candidate) && !excluded?.includes(candidate)) {
        onChange([...value, candidate]);
        break;
      }
      tries++;
    }
  };

  return (
    <Box className="rf-tickets__number-editor">
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="flex-start">
        <TextField
          label={label}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          inputProps={{ inputMode: "numeric", pattern: "\\d*" }}
          disabled={disabled || isFull}
          placeholder={"0".repeat(digits)}
          sx={{ minWidth: 160 }}
        />
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={addNumber} disabled={disabled || isFull}>
            Añadir
          </Button>
          <Button variant="outlined" onClick={addRandom} disabled={disabled || isFull}>
            Aleatorio
          </Button>
        </Stack>
      </Stack>

      {!!helperText && <FormHelperText sx={{ mt: 0.5 }}>{helperText}</FormHelperText>}

      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
        {value.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Sin números añadidos (máx. {maxCount})
          </Typography>
        ) : (
          value.map((n) => (
            <Chip key={n} label={n} onDelete={() => removeAt(n)} disabled={disabled} />
          ))
        )}
      </Stack>
    </Box>
  );
}
