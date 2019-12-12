import { Magento2 } from '../../../RestApi';
import BrowserPersistence from '../../../util/simplePersistence';
import { toggleDrawer } from '../app';
import actions from './actions';

const { request } = Magento2;
const storage = new BrowserPersistence();

export const createCart = payload =>
    async function thunk(dispatch, getState) {
        const { fetchCartId } = payload;
        const { cart } = getState();

        // if a cart already exists in the store, exit
        if (cart.cartId) {
            return;
        }

        // Request a new cart.
        dispatch(actions.getCart.request());

        // if a cart exists in storage, act like we just received it
        const cartId = await retrieveCartId();
        if (cartId) {
            dispatch(actions.getCart.receive(cartId));
            return;
        }

        try {
            // errors can come from graphql and are not thrown
            const { data, errors } = await fetchCartId();

            let receivePayload;

            if (errors) {
                receivePayload = new Error(errors);
            } else {
                receivePayload = data.cartId;
                // write to storage in the background
                saveCartId(data.cartId);
            }

            dispatch(actions.getCart.receive(receivePayload));
        } catch (error) {
            dispatch(actions.getCart.receive(error));
        }
    };

export const addItemToCart = (payload = {}) => {
    const { addItemMutation, fetchCartId, item, quantity, parentSku } = payload;

    const writingImageToCache = writeImageToCache(item);

    return async function thunk(dispatch, getState) {
        await writingImageToCache;
        dispatch(actions.addItem.request(payload));

        try {
            const { cart } = getState();
            const { cartId } = cart;

            const variables = {
                cartId,
                parentSku,
                product: item,
                quantity,
                sku: item.sku
            };

            await addItemMutation({
                variables
            });

            // 2019-02-07  Moved these dispatches to the success clause of
            // addItemToCart. The cart should only open on success.
            // In the catch clause, this action creator calls its own thunk,
            // so a successful retry will wind up here anyway.
            await dispatch(
                getCartDetails({
                    forceRefresh: true,
                    fetchCartId
                })
            );
            await dispatch(toggleDrawer('cart'));
            dispatch(actions.addItem.receive());
        } catch (error) {
            dispatch(actions.addItem.receive(error));

            const shouldRetry = !error.networkError && isInvalidCart(error);

            // Only retry if the cart is invalid or the cartId is missing.
            if (shouldRetry) {
                // Delete the cached ID from local storage and Redux.
                // In contrast to the save, make sure storage deletion is
                // complete before dispatching the error--you don't want an
                // upstream action to try and reuse the known-bad ID.
                await dispatch(removeCart());

                // then create a new one
                await dispatch(
                    createCart({
                        fetchCartId
                    })
                );

                // and fetch details
                await dispatch(
                    getCartDetails({
                        forceRefresh: true,
                        fetchCartId
                    })
                );

                // then retry this operation
                return thunk(...arguments);
            }
        }
    };
};

/**
 * Applies changes in options/quantity to a cart item.
 *
 * @param payload.cartItemId {Number} the id of the cart item we are updating
 * @param payload.item {Object} the new configuration item if changes are selected.
 * @param payload.quantity {Number} the quantity of the item being updated
 * @param payload.productType {String} 'ConfigurableProduct' or other.
 */
export const updateItemInCart = (payload = {}) => {
    const {
        cartItemId,
        fetchCartId,
        item,
        productType,
        quantity,
        removeItem,
        updateItem
    } = payload;
    const writingImageToCache = writeImageToCache(item);

    return async function thunk(dispatch, getState) {
        await writingImageToCache;
        dispatch(actions.updateItem.request(payload));

        const { cart, user } = getState();
        const { cartId } = cart;
        const { isSignedIn } = user;

        try {
            if (productType === 'ConfigurableProduct') {
                // You _must_ remove before adding or risk deleting the item
                // entirely if only quantity has been modified.
                await dispatch(
                    removeItemFromCart({
                        item: {
                            item_id: cartItemId
                        },
                        fetchCartId,
                        removeItem
                    })
                );
                await dispatch(
                    addItemToCart({
                        ...payload
                    })
                );
            } else {
                // If the product is a simple product we can just use the
                // updateCartItems graphql mutation.
                await updateItem({
                    variables: {
                        cartId,
                        itemId: cartItemId,
                        quantity
                    }
                });
                // The configurable product conditional dispatches actions that
                // each call getCartDetails. For simple items we must request
                // details after the mutation completes. This may change when
                // we migrate to the `cart` query for details, away from REST.
                await dispatch(
                    getCartDetails({
                        forceRefresh: true,
                        fetchCartId
                    })
                );
            }

            dispatch(actions.updateItem.receive());
        } catch (error) {
            dispatch(actions.updateItem.receive(error));

            const shouldRetry = !error.networkError && isInvalidCart(error);
            if (shouldRetry) {
                // Delete the cached ID from local storage and Redux.
                // In contrast to the save, make sure storage deletion is
                // complete before dispatching the error--you don't want an
                // upstream action to try and reuse the known-bad ID.
                await dispatch(removeCart());

                // then create a new one
                await dispatch(
                    createCart({
                        fetchCartId
                    })
                );

                // and fetch details
                await dispatch(
                    getCartDetails({
                        forceRefresh: true,
                        fetchCartId
                    })
                );

                if (isSignedIn) {
                    // The user is signed in and we just received their cart.
                    // Retry this operation.
                    return thunk(...arguments);
                } else {
                    // The user is a guest and just received a brand new (empty) cart.
                    // Add the updated item to that cart.
                    await dispatch(
                        addItemToCart({
                            ...payload
                        })
                    );
                }
            }
        }
    };
};

export const removeItemFromCart = payload => {
    const { item, fetchCartId, removeItem } = payload;

    return async function thunk(dispatch, getState) {
        dispatch(actions.removeItem.request(payload));

        const { cart } = getState();
        const { cartId } = cart;

        try {
            await removeItem({
                variables: {
                    cartId,
                    itemId: item.item_id
                }
            });

            dispatch(actions.removeItem.receive());
        } catch (error) {
            dispatch(actions.removeItem.receive(error));

            const shouldResetCart = !error.networkError && isInvalidCart(error);
            if (shouldResetCart) {
                // Delete the cached ID from local storage.
                // The reducer handles clearing out the bad ID from Redux.
                // In contrast to the save, make sure storage deletion is
                // complete before dispatching the error--you don't want an
                // upstream action to try and reuse the known-bad ID.
                await dispatch(removeCart());
                // then create a new one
                await dispatch(
                    createCart({
                        fetchCartId
                    })
                );
            }
        }

        await dispatch(
            getCartDetails({
                forceRefresh: true,
                fetchCartId
            })
        );
    };
};

export const getCartDetails = (payload = {}) => {
    const { forceRefresh, fetchCartId } = payload;

    return async function thunk(dispatch, getState) {
        const { cart, user } = getState();
        const { cartId } = cart;
        const { isSignedIn } = user;

        // if there isn't a cart, create one
        // then retry this operation
        if (!cartId) {
            await dispatch(
                createCart({
                    fetchCartId
                })
            );
            return thunk(...arguments);
        }

        // Once we have the cart id indicate that we are starting to make
        // async requests for the details.
        dispatch(actions.getDetails.request(cartId));

        try {
            const [
                imageCache,
                details,
                paymentMethods,
                totals
            ] = await Promise.all([
                retrieveImageCache(),
                fetchCartPart({
                    cartId,
                    forceRefresh,
                    isSignedIn
                }),
                fetchCartPart({
                    cartId,
                    forceRefresh,
                    isSignedIn,
                    subResource: 'payment-methods'
                }),
                fetchCartPart({
                    cartId,
                    forceRefresh,
                    isSignedIn,
                    subResource: 'totals'
                })
            ]);

            const { items } = details;

            // for each item in the cart, look up its image in the cache
            // and merge it into the item object
            // then assign its options from the totals subResource
            // TODO: If we don't have the image in cache we should probably try
            // to find it some other way otherwise we have no image to display
            // in the cart and will have to fall back to a placeholder.
            if (Array.isArray(items) && items.length) {
                const validTotals = totals && totals.items;
                items.forEach(item => {
                    item.image = item.image || imageCache[item.sku] || {};

                    let options = [];
                    if (validTotals) {
                        const matchingItem = totals.items.find(
                            t => t.item_id === item.item_id
                        );
                        if (matchingItem && matchingItem.options) {
                            options = JSON.parse(matchingItem.options);
                        }
                    }
                    item.options = options;
                });
            }

            dispatch(
                actions.getDetails.receive({ details, paymentMethods, totals })
            );
        } catch (error) {
            const { response } = error;

            dispatch(actions.getDetails.receive(error));

            // check if the cart has expired
            if (response && response.status === 404) {
                // if so, then delete the cached ID from local storage.
                // The reducer handles clearing out the bad ID from Redux.
                // In contrast to the save, make sure storage deletion is
                // complete before dispatching the error--you don't want an
                // upstream action to try and reuse the known-bad ID.
                await dispatch(removeCart());
                await dispatch(
                    createCart({
                        fetchCartId
                    })
                );
                // then retry this operation
                return thunk(...arguments);
            }
        }
    };
};

export const removeCart = () =>
    async function thunk(dispatch) {
        // Clear the cartId from local storage.
        await clearCartId();

        // Clear the cart info from the redux store.
        dispatch(actions.reset());
    };

/* helpers */

async function fetchCartPart({
    cartId,
    forceRefresh,
    isSignedIn,
    subResource = ''
}) {
    const signedInEndpoint = `/rest/V1/carts/mine/${subResource}`;
    const guestEndpoint = `/rest/V1/guest-carts/${cartId}/${subResource}`;
    const endpoint = isSignedIn ? signedInEndpoint : guestEndpoint;

    const cache = forceRefresh ? 'reload' : 'default';

    return request(endpoint, { cache });
}

export async function retrieveCartId() {
    return storage.getItem('cartId');
}

export async function saveCartId(id) {
    return storage.setItem('cartId', id);
}

export async function clearCartId() {
    return storage.removeItem('cartId');
}

async function retrieveImageCache() {
    return storage.getItem('imagesBySku') || {};
}

async function saveImageCache(cache) {
    return storage.setItem('imagesBySku', cache);
}

export async function writeImageToCache(item = {}) {
    const { media_gallery_entries: media, sku } = item;

    if (sku) {
        const image = media && (media.find(m => m.position === 1) || media[0]);

        if (image) {
            const imageCache = await retrieveImageCache();

            // if there is an image and it differs from cache
            // write to cache and save in the background
            if (imageCache[sku] !== image) {
                imageCache[sku] = image;
                saveImageCache(imageCache);

                return image;
            }
        }
    }
}

// Returns true if the cart is invalid.
function isInvalidCart(error) {
    return !!(
        error.graphQLErrors &&
        error.graphQLErrors.find(err =>
            err.message.includes('Could not find a cart')
        )
    );
}
