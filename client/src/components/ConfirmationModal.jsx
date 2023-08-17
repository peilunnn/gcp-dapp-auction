import { Modal, Button, Box, Card, Typography, styled } from "@mui/material";

function ConfirmationModal({
  isConfirmationModalOpen,
  handleConfirm,
  handleCancel,
  closeConfirmationModal,
  confirmationMessage,
}) {
  const CustomTypography = styled(Typography)`
    font-family: "Google Sans", sans-serif;
  `;

  return (
    <Modal open={isConfirmationModalOpen} onClose={closeConfirmationModal}>
      <Card
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          border: "1px solid #ccc",
          boxShadow: 24,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CustomTypography variant="h6" component="h2" textAlign="center">
          {confirmationMessage}
        </CustomTypography>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            mt: 2,
          }}
        >
          <Button variant="contained" onClick={handleConfirm}>
            Confirm
          </Button>
          <Button
            variant="contained"
            color="error"
            style={{ backgroundColor: "#b71c1c" }}
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </Box>
      </Card>
    </Modal>
  );
}

export default ConfirmationModal;
