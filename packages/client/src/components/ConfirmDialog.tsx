import { ReactNode } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { isNullUndefinedOrEmpty } from "@shared";
import mainStyles from '../styles/main.module.css';
import moduleStyles from "./ConfirmDialog.module.css";
import classNames from 'classnames';

const styles = {
  ...mainStyles,
  ...moduleStyles,
};

interface ConfirmDialogProps {
  open: boolean;
  title?: ReactNode;
  text: ReactNode;
  icon?: ReactNode
  onCancel(): void;
  onConfirm(): void;
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  const {
    open,
    title,
    text,
    icon,
    onCancel,
    onConfirm,
  } = props;

  return (
    <Dialog open={open} maxWidth="md" onClose={onCancel}>
      {
        isNullUndefinedOrEmpty(title)
          ? null
          : (
            <DialogTitle className={styles.confirmTitle}>
              { title }
            </DialogTitle>
          )
      }
      <DialogContent>
        <div className={classNames(styles.confirmContent, styles.confirmContentWithIcon)}>
          {icon ?? null}
          <span className={styles.text}>
            {text}
          </span>
        </div>
      </DialogContent>
      <DialogActions className={styles.confirmActions}>
        <Button
          className={styles.buttonType4}
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          className={styles.buttonType1}
          onClick={onConfirm}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
