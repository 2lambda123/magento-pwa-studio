import React from 'react';
import { createTestInstance } from '@magento/peregrine';
import { useItem } from '@magento/peregrine/lib/talons/MiniCart/useItem';

import Item from '../item';

jest.mock('../../../../classify');
jest.mock('@magento/peregrine/lib/talons/MiniCart/useItem', () => ({
    useItem: jest.fn().mockReturnValue({
        isDeleting: false,
        removeItem: () => {}
    })
}));

const props = {
    product: {
        name: 'P1',
        thumbnail: {
            url: 'www.venia.com/p1'
        }
    },
    id: 'p1',
    quantity: 10,
    configurable_options: [
        {
            label: 'Color',
            value: 'red'
        }
    ],
    handleRemoveItem: () => {},
    prices: {
        price: {
            value: 420,
            currency: 'USD'
        }
    }
};

test('Should render correctly', () => {
    const tree = createTestInstance(<Item {...props} />);

    expect(tree.toJSON()).toMatchSnapshot();
});

test('Should remove delete icon while loading', () => {
    useItem.mockReturnValueOnce({
        isDeleting: true,
        removeItem: () => {}
    });
    const tree = createTestInstance(<Item {...props} />);

    expect(tree.toJSON()).toMatchSnapshot();
});
