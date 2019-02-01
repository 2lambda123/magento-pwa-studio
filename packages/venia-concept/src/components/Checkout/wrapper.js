import React, { Component } from 'react';
import { connect } from 'src/drivers';
import { array, bool, func, object, oneOf, shape, string } from 'prop-types';

import {
    beginCheckout,
    cancelCheckout,
    editOrder,
    submitShippingAddress,
    submitOrder,
    submitPaymentMethodAndBillingAddress,
    submitShippingMethod
} from 'src/actions/checkout';

import Flow from './flow';

const hasData = value => !!value;
const isCartReady = cart => cart.details.items_count > 0;
const isCheckoutReady = checkout => {
    const {
        billingAddress,
        paymentData,
        shippingAddress,
        shippingMethod
    } = checkout;

    return [billingAddress, paymentData, shippingAddress, shippingMethod].every(
        hasData
    );
};

class CheckoutWrapper extends Component {
    static propTypes = {
        beginCheckout: func.isRequired,
        cancelCheckout: func.isRequired,
        cart: shape({
            details: object,
            guestCartId: string,
            totals: object
        }),
        checkout: shape({
            availableShippingMethods: array,
            billingAddress: shape({
                city: string,
                country_id: string,
                email: string,
                firstname: string,
                lastname: string,
                postcode: string,
                region_id: string,
                region_code: string,
                region: string,
                street: array,
                telephone: string
            }),
            editing: oneOf(['address', 'paymentMethod', 'shippingMethod']),
            incorrectAddressMessage: string,
            isAddressIncorrect: bool,
            paymentCode: string,
            paymentData: shape({
                description: string,
                details: shape({
                    cardType: string
                }),
                nonce: string
            }),
            shippingAddress: shape({
                city: string,
                country_id: string,
                email: string,
                firstname: string,
                lastname: string,
                postcode: string,
                region_id: string,
                region_code: string,
                region: string,
                street: array,
                telephone: string
            }),
            shippingMethod: string,
            shippingTitle: string,
            step: oneOf(['cart', 'form', 'receipt']).isRequired,
            submitting: bool.isRequired
        }),
        editOrder: func.isRequired,
        submitShippingAddress: func.isRequired,
        submitOrder: func.isRequired,
        submitPaymentMethodAndBillingAddress: func.isRequired,
        submitShippingMethod: func.isRequired
    };

    render() {
        const {
            beginCheckout,
            cancelCheckout,
            cart,
            checkout,
            editOrder,
            requestOrder,
            submitShippingAddress,
            submitOrder,
            submitPaymentMethodAndBillingAddress,
            submitShippingMethod
        } = this.props;

        // ensure state slices are present
        if (!(cart && checkout)) {
            return null;
        }

        const actions = {
            beginCheckout,
            cancelCheckout,
            editOrder,
            requestOrder,
            submitShippingAddress,
            submitOrder,
            submitPaymentMethodAndBillingAddress,
            submitShippingMethod
        };

        const {
            availableShippingMethods,
            paymentData,
            shippingAddress,
            shippingMethod
        } = checkout;

        const miscProps = {
            availableShippingMethods,
            hasPaymentMethod: hasData(paymentData),
            hasShippingAddress: hasData(shippingAddress),
            hasShippingMethod: hasData(shippingMethod),
            isCartReady: isCartReady(cart),
            isCheckoutReady: isCheckoutReady(checkout)
        };

        const flowProps = { actions, cart, checkout, ...miscProps };
        return <Flow {...flowProps} />;
    }
}

const mapStateToProps = ({ cart, checkout }) => ({ cart, checkout });

const mapDispatchToProps = {
    beginCheckout,
    cancelCheckout,
    editOrder,
    submitShippingAddress,
    submitOrder,
    submitPaymentMethodAndBillingAddress,
    submitShippingMethod
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CheckoutWrapper);
