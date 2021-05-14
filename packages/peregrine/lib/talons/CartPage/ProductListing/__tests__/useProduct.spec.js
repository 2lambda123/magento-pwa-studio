import React, { useEffect, useState } from 'react';

import { createTestInstance } from '@magento/peregrine';
import { useMutation, useQuery } from '@apollo/client';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useUserContext } from '@magento/peregrine/lib/context/user';

import { useProduct } from '../useProduct';
import { useWishlist } from '../useWishlist';

import { act } from 'react-test-renderer';

jest.mock('react', () => {
    const React = jest.requireActual('react');
    const spy = jest.spyOn(React, 'useState');

    return {
        ...React,
        useState: spy
    };
});

jest.mock('@apollo/client', () => {
    const ApolloClient = jest.requireActual('@apollo/client');

    const spy = jest.spyOn(ApolloClient, 'useMutation');
    spy.mockImplementation(() => [
        jest.fn(),
        {
            data: {},
            loading: false,
            error: null
        }
    ]);

    return {
        ...ApolloClient,
        useQuery: jest.fn().mockReturnValue({
            called: false,
            error: null,
            loading: false,
            data: {
                storeConfig: {
                    id: 1,
                    configurable_thumbnail_source: 'parent'
                }
            }
        }),
        useMutation: spy
    };
});

jest.mock('@magento/peregrine/lib/context/app', () => {
    const state = {
        drawer: null
    };
    const api = { toggleDrawer: jest.fn() };
    const useAppContext = jest.fn(() => [state, api]);

    return { useAppContext };
});

jest.mock('@magento/peregrine/lib/context/cart', () => {
    const state = {
        cartId: 'cart123'
    };
    const api = {};
    const useCartContext = jest.fn(() => [state, api]);

    return { useCartContext };
});

jest.mock('@magento/peregrine/lib/context/user', () => ({
    useUserContext: jest.fn().mockReturnValue([{ isSignedIn: true }])
}));

jest.mock('../useWishlist', () => ({
    useWishlist: jest.fn().mockReturnValue({
        handleAddToWishlist: jest.fn().mockResolvedValue(true),
        loading: true,
        called: true,
        error: null
    })
}));

const props = {
    item: {
        prices: {
            price: {
                value: 99,
                currency: 'USD'
            }
        },
        product: {
            name: 'unit test',
            small_image: {
                url: 'test.webp'
            }
        },
        quantity: 7,
        id: 'ItemID'
    },
    mutations: {
        removeItemMutation: '',
        updateItemQuantityMutation: ''
    },
    setActiveEditItem: jest.fn(),
    setIsCartUpdating: jest.fn(),
    onAddToWishlistSuccess: jest.fn()
};

const log = jest.fn();
const Component = props => {
    const talonProps = useProduct({ ...props });

    useEffect(() => {
        log(talonProps);
    }, [talonProps]);

    return <i talonProps={talonProps} />;
};

test('it returns the proper shape', () => {
    // Arrange.
    useMutation.mockReturnValueOnce([jest.fn(), {}]);
    useMutation.mockReturnValueOnce([jest.fn(), {}]);

    const tree = createTestInstance(<Component {...props} />);
    expect(tree.toJSON()).toMatchSnapshot();
});

test('it returns the proper shape when use variant image is configured', () => {
    // Arrange.
    useMutation.mockReturnValueOnce([jest.fn(), {}]);
    useMutation.mockReturnValueOnce([jest.fn(), {}]);
    useQuery.mockReturnValueOnce({
        called: false,
        error: null,
        loading: false,
        data: {
            storeConfig: {
                id: 1,
                configurable_thumbnail_source: 'itself'
            }
        }
    });
    const configurableProps = {
        ...props,
        item: {
            ...props.item,
            product: {
                ...props.item.product,
                variants: [
                    {
                        attributes: [
                            {
                                uid: 'Y29uZmlndXJhYmxlLzIyLzI='
                            }
                        ],
                        product: {
                            small_image: {
                                url: 'variant1.webp'
                            }
                        }
                    },
                    {
                        attributes: [
                            {
                                uid: 'Y29uZmlndXJhYmxlLzIyLzM='
                            }
                        ],
                        product: {
                            small_image: {
                                url: 'variant2.webp'
                            }
                        }
                    }
                ]
            },
            configurable_options: [
                {
                    id: 22,
                    option_label: 'Color',
                    value_label: 'red',
                    value_id: 2
                }
            ]
        }
    };

    const tree = createTestInstance(<Component {...configurableProps} />);
    expect(tree.toJSON()).toMatchSnapshot();
});

test('it returns the correct error message when the error is not graphql', async () => {
    expect.assertions(1);

    // Arrange.
    useMutation.mockReturnValueOnce([jest.fn(), {}]);
    useMutation.mockReturnValueOnce([
        jest.fn().mockRejectedValue(new Error('nope')),
        { error: new Error('test!') }
    ]);

    useState.mockReturnValueOnce([true, jest.fn()]);
    useState.mockReturnValueOnce([true, jest.fn()]);

    // Act.
    const tree = createTestInstance(<Component {...props} />);
    const { root } = tree;
    const { talonProps } = root.findByType('i').props;

    expect(talonProps.errorMessage).toMatchInlineSnapshot(`"test!"`);
});

test('it returns the correct error message when the error is graphql', () => {
    // Arrange.
    useMutation.mockReturnValueOnce([jest.fn(), {}]);
    useMutation.mockReturnValueOnce([
        jest.fn(),
        {
            error: {
                graphQLErrors: [new Error('test a'), new Error('test b')]
            }
        }
    ]);

    useState.mockReturnValueOnce([true, jest.fn()]);
    useState.mockReturnValueOnce([true, jest.fn()]);

    // Act.
    const tree = createTestInstance(<Component {...props} />);
    const { root } = tree;
    const { talonProps } = root.findByType('i').props;

    // Assert.
    expect(talonProps.errorMessage).toMatchInlineSnapshot(`"test a, test b"`);
});

test('it returns correct error message when multiple sources report errors', () => {
    // Arrange.
    useMutation.mockReturnValueOnce([
        jest.fn(),
        {
            error: {
                graphQLErrors: [new Error('test a'), new Error('test b')]
            }
        }
    ]);
    useMutation.mockReturnValueOnce([
        jest.fn(),
        {
            error: {
                graphQLErrors: [new Error('test c')]
            }
        }
    ]);

    useState.mockReturnValueOnce([true, jest.fn()]);
    useState.mockReturnValueOnce([true, jest.fn()]);

    useWishlist.mockReturnValueOnce({
        handleAddToWishlist: jest.fn(),
        loading: false,
        called: true,
        error: {
            graphQLErrors: [new Error('test d'), new Error('test e')]
        }
    });

    // Act.
    const tree = createTestInstance(<Component {...props} />);
    const { root } = tree;
    const { talonProps } = root.findByType('i').props;

    // Assert.
    expect(talonProps.errorMessage).toMatchInlineSnapshot(
        `"test c, test a, test b, test d, test e"`
    );
});

test('it resets cart updating flag on unmount', () => {
    const setIsCartUpdating = jest.fn();

    const tree = createTestInstance(
        <Component {...props} setIsCartUpdating={setIsCartUpdating} />
    );

    act(() => {
        tree.unmount();
    });

    expect(setIsCartUpdating).toHaveBeenCalledWith(false);
});

test('it tells the cart when a mutation is in flight', () => {
    useMutation.mockReturnValueOnce([
        jest.fn(),
        {
            called: true,
            loading: true
        }
    ]);
    useMutation.mockReturnValueOnce([jest.fn(), {}]);

    const setIsCartUpdating = jest.fn();

    createTestInstance(
        <Component {...props} setIsCartUpdating={setIsCartUpdating} />
    );

    expect(setIsCartUpdating).toHaveBeenCalledWith(true);
});

test('it handles editing the product', () => {
    const setActiveEditItem = jest.fn();
    const tree = createTestInstance(
        <Component {...props} setActiveEditItem={setActiveEditItem} />
    );

    const { root } = tree;
    const { talonProps } = root.findByType('i').props;

    const { handleEditItem } = talonProps;

    act(() => {
        handleEditItem();
    });

    expect(setActiveEditItem).toHaveBeenCalled();
    expect(setActiveEditItem.mock.calls[0][0]).toMatchInlineSnapshot(`
        Object {
          "id": "ItemID",
          "prices": Object {
            "price": Object {
              "currency": "USD",
              "value": 99,
            },
          },
          "product": Object {
            "name": "unit test",
            "small_image": Object {
              "url": "test.webp",
            },
          },
          "quantity": 7,
        }
    `);
});

describe('it handles cart removal', () => {
    test('with no errors', () => {
        const removeItem = jest.fn();
        useMutation.mockReturnValueOnce([removeItem, {}]);
        useMutation.mockReturnValueOnce([jest.fn(), {}]);
        const tree = createTestInstance(<Component {...props} />);

        const { root } = tree;
        const { talonProps } = root.findByType('i').props;

        const { handleEditItem, handleRemoveFromCart } = talonProps;

        act(async () => {
            handleEditItem();
            await handleRemoveFromCart();
        });

        expect(removeItem).toHaveBeenCalled();
        expect(removeItem.mock.calls[0][0]).toMatchInlineSnapshot(`
            Object {
              "variables": Object {
                "cartId": "cart123",
                "itemId": "ItemID",
              },
            }
        `);
    });

    test('with a thrown error', () => {
        const error = new Error('Item removal error');
        const removeItem = jest.fn(() => {
            throw error;
        });
        //First render
        useMutation.mockReturnValueOnce([removeItem, {}]);
        useMutation.mockReturnValueOnce([jest.fn(), {}]);
        //Second render
        useMutation.mockReturnValueOnce([
            removeItem,
            {
                called: true,
                error: error,
                loading: false
            }
        ]);
        useMutation.mockReturnValueOnce([jest.fn(), {}]);

        const tree = createTestInstance(<Component {...props} />);

        const { root } = tree;
        const { talonProps } = root.findByType('i').props;

        expect(talonProps.errorMessage).toBeFalsy();

        const { handleRemoveFromCart } = talonProps;

        act(async () => {
            await handleRemoveFromCart();
        });

        const { talonProps: updatedProps } = tree.root.findByType('i').props;

        expect(updatedProps.errorMessage).toBeTruthy();
    });
});

describe('it handles item quantity updates', () => {
    test('with no errors', () => {
        const updateItemQuantity = jest.fn();
        useMutation.mockReturnValueOnce([jest.fn(), {}]);
        useMutation.mockReturnValueOnce([updateItemQuantity, {}]);
        const tree = createTestInstance(<Component {...props} />);

        const { root } = tree;
        const { talonProps } = root.findByType('i').props;

        const { handleUpdateItemQuantity } = talonProps;

        act(() => {
            handleUpdateItemQuantity(100);
        });

        expect(updateItemQuantity).toHaveBeenCalled();
        expect(updateItemQuantity.mock.calls[0][0]).toMatchInlineSnapshot(`
            Object {
              "variables": Object {
                "cartId": "cart123",
                "itemId": "ItemID",
                "quantity": 100,
              },
            }
        `);
    });

    test('with a thrown error', () => {
        const error = new Error('Item quantity update error');
        const updateItemQuantity = jest.fn(() => {
            throw error;
        });
        //First render
        useMutation.mockReturnValueOnce([jest.fn(), {}]);
        useMutation.mockReturnValueOnce([updateItemQuantity, {}]);
        //Second renderer
        useMutation.mockReturnValueOnce([jest.fn(), {}]);
        useMutation.mockReturnValueOnce([
            updateItemQuantity,
            {
                called: true,
                error: error,
                loading: false
            }
        ]);

        const tree = createTestInstance(<Component {...props} />);

        const { root } = tree;
        const { talonProps } = root.findByType('i').props;

        expect(talonProps.errorMessage).toBeFalsy();

        const { handleUpdateItemQuantity } = talonProps;

        act(() => {
            handleUpdateItemQuantity(100);
        });

        const { talonProps: updatedProps } = tree.root.findByType('i').props;

        expect(updatedProps.errorMessage).toBeTruthy();
    });
});

test('it does not set the active edit item when drawer is open', () => {
    useAppContext.mockReturnValue([
        { drawer: 'search.filter' },
        { toggleDrawer: jest.fn() }
    ]);

    const setActiveEditItem = jest.fn();
    createTestInstance(
        <Component {...props} setActiveEditItem={setActiveEditItem} />
    );

    expect(setActiveEditItem).not.toHaveBeenCalled();
});

describe('testing save for later feature', () => {
    test('it should show login toast if user is not logged in', async () => {
        useUserContext.mockReturnValueOnce([{ isSignedIn: false }]);

        const tree = createTestInstance(<Component {...props} />);

        const { root } = tree;
        const { talonProps } = root.findByType('i').props;

        await talonProps.handleSaveForLater();

        tree.update(<Component {...props} />);
        const { talonProps: updatedTalonProps } = root.findByType('i').props;

        expect(updatedTalonProps.loginToastProps).toMatchSnapshot();
    });

    test('it should add item to wishlist when user is logged in', async () => {
        useUserContext.mockReturnValueOnce([{ isSignedIn: true }]);

        const handleAddToWishlist = jest.fn().mockResolvedValue(true);
        useWishlist.mockReturnValueOnce({
            handleAddToWishlist,
            loading: false,
            called: true,
            error: null
        });

        const tree = createTestInstance(<Component {...props} />);

        const { root } = tree;
        const { talonProps } = root.findByType('i').props;

        await talonProps.handleSaveForLater();

        expect(handleAddToWishlist).toHaveBeenCalled();
    });
});
