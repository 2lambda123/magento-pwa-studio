import React from 'react';
import { func, shape, string } from 'prop-types';
import { X as CloseIcon } from 'react-feather';

import { useEditModal } from '@magento/peregrine/lib/talons/CheckoutPage/PaymentInformation/useEditModal';

import Button from '../../Button';
import Icon from '../../Icon';
import { Modal } from '../../Modal';
import { mergeClasses } from '../../../classify';
import CreditCard from './creditCard';

import editModalOperations from './editModal.gql';

import defaultClasses from './editModal.css';

const EditModal = props => {
    const { classes: propClasses, onClose } = props;

    const classes = mergeClasses(defaultClasses, propClasses);

    const talonProps = useEditModal({ onClose, ...editModalOperations });

    const {
        selectedPaymentMethod,
        isLoading,
        handleUpdate,
        handleClose,
        handlePaymentSuccess,
        handleDropinReady,
        updateButtonClicked,
        resetUpdateButtonClicked,
        handlePaymentError
    } = talonProps;

    const actionButtons = !isLoading ? (
        <div className={classes.actions_container}>
            <Button
                className={classes.cancel_button}
                onClick={handleClose}
                priority="normal"
                disabled={updateButtonClicked}
            >
                {'Cancel'}
            </Button>
            <Button
                className={classes.update_button}
                onClick={handleUpdate}
                priority="high"
                disabled={updateButtonClicked}
            >
                {'Update'}
            </Button>
        </div>
    ) : null;

    const paymentMethod =
        selectedPaymentMethod === 'braintree' ? (
            <div className={classes.body}>
                <CreditCard
                    isHidden={false}
                    shouldSubmit={updateButtonClicked}
                    resetShouldSubmit={resetUpdateButtonClicked}
                    onDropinReady={handleDropinReady}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    brainTreeDropinContainerId={
                        'edit-modal-braintree-dropin-container'
                    }
                />
                {actionButtons}
            </div>
        ) : (
            <div>{`${selectedPaymentMethod} is not supported for editing.`}</div>
        );

    return (
        <Modal>
            <aside className={classes.root_open}>
                <div className={classes.header}>
                    <span className={classes.header_text}>
                        Edit Payment Information
                    </span>
                    <button
                        className={classes.close_button}
                        onClick={handleClose}
                    >
                        <Icon src={CloseIcon} />
                    </button>
                </div>
                {paymentMethod}
            </aside>
        </Modal>
    );
};

export default EditModal;

EditModal.propTypes = {
    classes: shape({
        root: string,
        root_open: string,
        body: string,
        header: string,
        header_text: string,
        actions_container: string,
        cancel_button: string,
        update_button: string,
        close_button: string
    }),
    onClose: func.isRequired
};
