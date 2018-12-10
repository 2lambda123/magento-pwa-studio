import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import Product from '../product';
import Section from '../section';

configure({ adapter: new Adapter() });

const classes = { firstSection: 'a' };

const item = {
    item_id: 1,
    name: 'Product 1',
    price: 10,
    qty: 1,
    sku: 'TEST1',
    image: 'test.jpg'
};

const totalsItems = [
    {
        item_id: 1,
        name: 'Product 1',
        // REST API returns options as string
        options: JSON.stringify([
            { value: 'Peach', label: 'Fashion Color' },
            { value: 'M', label: 'Fashion Size' }
        ])
    }
];

test('passed functions are called from nested `Section` components', () => {
    const removeItemFromCart = jest.fn();
    const showEditPanel = jest.fn();
    let wrapper = shallow(
        <Product
            classes={classes}
            item={item}
            currencyCode={'NZD'}
            removeItemFromCart={removeItemFromCart}
            showEditPanel={showEditPanel}
            totalsItems={totalsItems}
        />
    ).dive();

    const favoriteItem = jest.spyOn(wrapper.instance(), 'favoriteItem');
    const editItem = jest.spyOn(wrapper.instance(), 'editItem');
    const removeItem = jest.spyOn(wrapper.instance(), 'removeItem');

    wrapper.instance().forceUpdate();

    const buttons = wrapper.find(Section);

    buttons.forEach(button => {
        button.simulate('click');
    });

    expect(favoriteItem).toHaveBeenCalled();
    expect(editItem).toHaveBeenCalled();
    expect(removeItem).toHaveBeenCalled();
});

test('Product variants are rendered', () => {
    const wrapper = shallow(
        <Product item={item} currencyCode={'EUR'} totalsItems={totalsItems} />
    ).dive();

    // The product's name is in the div at index 1.
    expect(
        wrapper
            .find('div')
            .at(1)
            .text()
    ).toEqual(item.name);

    // The product variants are rendered.
    const expectedOptions = JSON.parse(totalsItems[0].options);
    expectedOptions.forEach((option, index) => {
        expect(
            wrapper
                .find('dt')
                .at(index)
                .text()
        ).toContain(option.label);
        expect(
            wrapper
                .find('dd')
                .at(index)
                .text()
        ).toEqual(option.value);
    });
});
