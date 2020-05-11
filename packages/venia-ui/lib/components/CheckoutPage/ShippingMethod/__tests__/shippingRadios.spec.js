import React from 'react';
import { createTestInstance } from '@magento/peregrine';

import ShippingRadios from '../shippingRadios';

jest.mock('../../../../classify');
jest.mock(
    '../../../CartPage/PriceAdjustments/ShippingMethods/shippingRadio',
    () => ({
        ShippingRadio: () => <mock>Shipping Radio</mock>
    })
);
jest.mock('../../../LoadingIndicator', () => 'Loading Indicator');
jest.mock('../../../RadioGroup', () => 'Radio Group');

const props = {
    isLoading: false,
    shippingMethods: [
        {
            amount: {
                currency: 'USD',
                value: 99
            },
            available: true,
            carrier_code: 'flatrate',
            carrier_title: 'Flat Rate',
            method_code: 'flatrate',
            method_title: 'Flat Rate',
            serializedValue: 'flatrate|flatrate'
        }
    ]
};

test('it renders correctly', () => {
    // Act.
    const instance = createTestInstance(<ShippingRadios {...props} />);

    // Assert.
    expect(instance.toJSON()).toMatchSnapshot();
});

test('it renders correctly when loading', () => {
    // Arrange.
    const myProps = {
        ...props,
        isLoading: true
    };

    // Act.
    const instance = createTestInstance(<ShippingRadios {...myProps} />);

    // Assert.
    expect(instance.toJSON()).toMatchSnapshot();
});

test('it renders an error when no shipping methods', () => {
    // Arrange.
    const myProps = {
        ...props,
        shippingMethods: []
    };

    // Act.
    const instance = createTestInstance(<ShippingRadios {...myProps} />);

    // Assert.
    expect(instance.toJSON()).toMatchSnapshot();
});
