// PATH: erp-frontend/src/modules/raffles/pages/TicketCreatePage.jsx
import * as React from "react";
import { Container, Snackbar, Alert } from "@mui/material";
import PageHeader from "@core/components/ui/PageHeader";
import TicketForm from "@modules/raffles/components/forms/tickets/TicketForm";
import { useNavigate } from "react-router-dom";
import { addToCart, confirmPurchase } from "@modules/raffles/utils/cart";

/**
 * Página: Nuevo Tiquete
 * - Conecta el formulario a acciones simuladas (localStorage)
 * - Redirige al listado luego de confirmar compra
 */
export default function TicketCreatePage() {
  const navigate = useNavigate();
  const [snack, setSnack] = React.useState({ open: false, msg: "", severity: "success" });

  const handleAddToCart = (draft) => {
    addToCart(draft);
    setSnack({ open: true, msg: "Tiquete añadido a la compra (pendiente).", severity: "info" });
  };

  const handleConfirm = (draft) => {
    confirmPurchase(draft);
    setSnack({ open: true, msg: "Compra confirmada (simulada).", severity: "success" });
    setTimeout(() => navigate("/raffles/tickets"), 800);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        title="Nuevo tiquete"
        breadcrumbs={[
          { label: "Rifas", href: "/raffles" },
          { label: "Gestión de tiquetes", href: "/raffles/tickets" },
          { label: "Nuevo" },
        ]}
      />
      <TicketForm onAddToCart={handleAddToCart} onConfirmPurchase={handleConfirm} />

      <Snackbar
        open={snack.open}
        autoHideDuration={2400}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snack.severity} variant="filled" sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
