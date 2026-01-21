import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => {
  return (
    <Modal
      title={
        <span>
          <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
          {title}
        </span>
      }
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Confirm"
      cancelText="Cancel"
      okButtonProps={{ danger: true }}
    >
      <p>{message}</p>
    </Modal>
  );
};

export default ConfirmDialog;
