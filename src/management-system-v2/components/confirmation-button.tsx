import { ComponentProps, FC, PropsWithChildren, useState } from 'react';
import { Button, Modal, Tooltip } from 'antd';

type ConfirmationModalProps = {
  onConfirm: () => Promise<any> | any;
  title: string;
  description: string;
  canCloseWhileLoading?: boolean;
  modalProps?: Omit<
    ComponentProps<typeof Modal>,
    'open' | 'title' | 'onOk' | 'confirmLoading' | 'onCancel'
  >;
  buttonProps?: ComponentProps<typeof Button>;
  tooltip?: string;
};

const ConfirmationButton: FC<PropsWithChildren<ConfirmationModalProps>> = ({
  children,
  onConfirm,
  title,
  description,
  canCloseWhileLoading = false,
  modalProps,
  buttonProps,
  tooltip,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const clearModal = () => {
    setModalOpen(false);
    setLoading(false);
  };

  const onConfirmWrapper = async () => {
    setLoading(true);

    try {
      await onConfirm();
    } catch (err) {}

    clearModal();
  };

  return (
    <>
      <Modal
        closeIcon={null}
        {...modalProps}
        title={title}
        open={modalOpen}
        onOk={onConfirmWrapper}
        confirmLoading={loading}
        onCancel={() => (canCloseWhileLoading || !loading) && setModalOpen(false)}
        cancelButtonProps={{ disabled: !canCloseWhileLoading && loading }}
      >
        <p>{description}</p>
      </Modal>

      <Tooltip title={tooltip}>
        <Button
          {...buttonProps}
          onClick={() => setModalOpen(true)}
          disabled={modalOpen || buttonProps?.disabled}
          loading={loading}
        >
          {children}
        </Button>
      </Tooltip>
    </>
  );
};

export default ConfirmationButton;
