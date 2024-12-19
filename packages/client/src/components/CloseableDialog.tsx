import { noop } from "lodash";
import { Dialog, DialogProps } from "@mui/material";
import styles from "./CloseableDialog.module.css";
import { useCallback } from 'react';

interface CloseableDialogProps extends DialogProps {
  title: string;
  onClose(event: {}, reason: "closeClicked" | "backdropClick" | "escapeKeyDown"): void;
}

export function CloseableDialog({
  open,
  title,
  children,
  onClose = noop,
  ...dialogProps
}: CloseableDialogProps): JSX.Element | null {

  const handleCloseButtonClick = useCallback(
    (_event?: {}, reason?: string) => {
      onClose({}, (reason ?? "closeClicked") as any);
    },
    [
      onClose
    ]
  );

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      onClose={handleCloseButtonClick}
      {...dialogProps}
    >
      <div className={styles.closeableDialogContainer}>
        <div
          className={styles.closeableDialogCloseButton}
          onClick={handleCloseButtonClick}
        >
          X
        </div>
        {title && <p className={styles.closeableDialogTitle}>{title}</p>}
        <div className={styles.closeableDialogBody}>{children}</div>
      </div>
    </Dialog>
  );
}
