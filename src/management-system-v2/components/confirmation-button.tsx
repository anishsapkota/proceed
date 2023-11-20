import { ComponentProps, FC, PropsWithChildren, useState } from 'react';
import { Button, Modal } from 'antd';

type ConfirmationModalProps = {
  onConfirm: (...args: any[]) => Promise<any> | any;
  title: string;
  description: string;
  canCloseWhileLoading?: boolean;
  modalProps?: Omit<
    ComponentProps<typeof Modal>,
    'open' | 'title' | 'onOk' | 'confirmLoading' | 'onCancel'
  >;
  buttonProps?: ComponentProps<typeof Button>;
};

const ConfirmationButton: FC<PropsWithChildren<ConfirmationModalProps>> = ({
  children,
  onConfirm,
  title,
  description,
  canCloseWhileLoading = false,
  modalProps,
  buttonProps,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const clearModal = () => {
    setModalOpen(false);
    setLoading(false);
  };

  const onConfirmWrapper = () => {
    setLoading(true);
    const possiblePromise = onConfirm();

    if (
      typeof possiblePromise === 'object' &&
      'then' in possiblePromise &&
      typeof possiblePromise.then === 'function'
    )
      possiblePromise.then(clearModal).catch(clearModal);
    else clearModal();
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
        cancelButtonProps={{ disabled: loading }}
      >
        <p>{description}</p>
      </Modal>
      <Button
        {...buttonProps}
        onClick={() => setModalOpen(true)}
        disabled={modalOpen || buttonProps?.disabled}
        loading={loading}
      >
        {children}
      </Button>
    </>
  );
};

export default ConfirmationButton;
