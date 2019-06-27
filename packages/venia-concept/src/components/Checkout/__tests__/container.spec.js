import {
    beginCheckout,
    cancelCheckout,
    editOrder,
    submitShippingAddress,
    submitOrder,
    submitPaymentMethodAndBillingAddress,
    submitShippingMethod
} from 'src/actions/checkout';

import ConnectedCheckoutContainer from '../index';

jest.mock('src/classify');
jest.mock('src/drivers', () => ({
    connect: jest.fn((mapStateToProps, mapDispatchToProps) =>
        jest.fn(component => ({
            component,
            mapStateToProps,
            mapDispatchToProps
        }))
    ),
    withRouter: component => {
        component.defaultProps = {
            ...component.defaultProps,
            router: { pathname: 'mocked-path' }
        };
        return component;
    }
}));

test('returns a connected CheckoutContainer component', () => {
    expect(ConnectedCheckoutContainer.component).toBeInstanceOf(Function);
    expect(ConnectedCheckoutContainer.mapStateToProps).toBeInstanceOf(Function);
    expect(ConnectedCheckoutContainer.mapDispatchToProps).toMatchObject({
        beginCheckout,
        cancelCheckout,
        editOrder,
        submitShippingAddress,
        submitOrder,
        submitPaymentMethodAndBillingAddress,
        submitShippingMethod
    });
});

test('mapStateToProps correctly maps state to props', () => {
    const { mapStateToProps } = ConnectedCheckoutContainer;

    const state = {
        cart: {},
        checkout: {},
        directory: {},
        extra: 'extra'
    };

    const props = mapStateToProps(state);
    expect(props).not.toHaveProperty('extra');
    expect(props).toMatchObject({
        cart: state.cart,
        checkout: state.checkout,
        directory: state.directory
    });
});
