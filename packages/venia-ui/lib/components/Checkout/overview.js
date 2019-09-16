import React, { Fragment, useCallback } from 'react';
import { bool, func, number, object, shape, string } from 'prop-types';

import PaymentMethodSummary from './paymentMethodSummary';
import ShippingAddressSummary from './shippingAddressSummary';
import ShippingMethodSummary from './shippingMethodSummary';
import Section from './section';
import Button from '../Button';
import { Price } from '@magento/peregrine';

/**
 * The Overview component renders summaries for each section of the editable
 * form.
 */
const Overview = props => {
    const {
        cancelCheckout,
        cart,
        classes,
        hasPaymentMethod,
        hasShippingAddress,
        hasShippingMethod,
        isSubmitting,
        paymentData,
        ready,
        setEditing,
        shippingAddress,
        shippingTitle,
        submitOrder
    } = props;

    const handleAddressFormClick = useCallback(() => {
        setEditing('address');
    }, [setEditing]);

    const handlePaymentFormClick = useCallback(() => {
        setEditing('paymentMethod');
    }, [setEditing]);

    const handleShippingFormClick = useCallback(() => {
        setEditing('shippingMethod');
    }, [setEditing]);

    const currencyCode =
        (cart && cart.totals && cart.totals.quote_currency_code) || 'USD';
    const subtotal = (cart && cart.totals && cart.totals.subtotal) || 0;

    return (
        <Fragment>
            <div className={classes.body}>
                <Section
                    label="Ship To"
                    onClick={handleAddressFormClick}
                    showEditIcon={hasShippingAddress}
                >
                    <ShippingAddressSummary
                        classes={classes}
                        hasShippingAddress={hasShippingAddress}
                        shippingAddress={shippingAddress}
                    />
                </Section>
                <Section
                    label="Pay With"
                    onClick={handlePaymentFormClick}
                    showEditIcon={hasPaymentMethod}
                >
                    <PaymentMethodSummary
                        classes={classes}
                        hasPaymentMethod={hasPaymentMethod}
                        paymentData={paymentData}
                    />
                </Section>
                <Section
                    label="Use"
                    onClick={handleShippingFormClick}
                    showEditIcon={hasShippingMethod}
                >
                    <ShippingMethodSummary
                        classes={classes}
                        hasShippingMethod={hasShippingMethod}
                        shippingTitle={shippingTitle}
                    />
                </Section>
                <Section label="TOTAL">
                    <Price currencyCode={currencyCode} value={subtotal} />
                    <br />
                    <span>{cart.details.items_qty} Items</span>
                </Section>
            </div>
            <div className={classes.footer}>
                <Button onClick={cancelCheckout}>Back to Cart</Button>
                <Button
                    priority="high"
                    disabled={isSubmitting || !ready}
                    onClick={submitOrder}
                >
                    Confirm Order
                </Button>
            </div>
        </Fragment>
    );
};

Overview.propTypes = {
    cancelCheckout: func.isRequired,
    cart: shape({
        details: shape({
            items_qty: number
        }).isRequired,
        cartId: string,
        totals: shape({
            quote_currency_code: string,
            subtotal: number
        }).isRequired
    }).isRequired,
    classes: shape({
        body: string,
        footer: string
    }),
    hasPaymentMethod: bool,
    hasShippingAddress: bool,
    hasShippingMethod: bool,
    isSubmitting: bool,
    paymentData: object,
    ready: bool,
    setEditing: func,
    shippingAddress: object,
    shippingTitle: string,
    submitOrder: func,
    submitting: bool
};

export default Overview;
