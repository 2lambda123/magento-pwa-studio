import { RestApi } from '@magento/peregrine';

import { closeDrawer, toggleDrawer } from 'src/actions/app';
import checkoutActions from 'src/actions/checkout';
import BrowserPersistence from 'src/util/simplePersistence';
import actions from './actions';

const { request } = RestApi.Magento2;
const storage = new BrowserPersistence();

export const createGuestCart = () =>
    async function thunk(dispatch, getState) {
        const { cart } = getState();

        // if a guest cart already exists, exit
        if (cart.guestCartId) {
            return;
        }

        // reset the checkout workflow
        // in case the user has already completed an order this session
        dispatch(checkoutActions.reset());

        const guestCartId = await retrieveGuestCartId();

        // if a guest cart exists in storage, act like we just received it
        if (guestCartId) {
            dispatch(actions.getGuestCart.receive(guestCartId));
            return;
        }

        // otherwise, request a new guest cart
        dispatch(actions.getGuestCart.request());

        try {
            const id = await request('/rest/V1/guest-carts', {
                method: 'POST'
            });

            // write to storage in the background
            saveGuestCartId(id);
            dispatch(actions.getGuestCart.receive(id));
        } catch (error) {
            dispatch(actions.getGuestCart.receive(error));
        }
    };

export const addItemToCart = (payload = {}) => {
    const { item, quantity } = payload;

    writeImageToCache(item);

    return async function thunk(dispatch, getState) {
        dispatch(actions.addItem.request(payload));

        try {
            const { cart } = getState();
            const { guestCartId } = cart;

            if (!guestCartId) {
                throw new Error('Missing required information: guestCartId');
            }

            const cartItem = await request(
                `/rest/V1/guest-carts/${guestCartId}/items`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        cartItem: {
                            qty: quantity,
                            sku: item.sku,
                            name: item.name,
                            quote_id: guestCartId
                        }
                    })
                }
            );

            dispatch(actions.addItem.receive({ cartItem, item, quantity }));
        } catch (error) {
            const { response } = error;

            dispatch(actions.addItem.receive(error));

            // check if the guest cart has expired
            if (response && response.status === 404) {
                // if so, create a new one
                await dispatch(createGuestCart());
                // then retry this operation
                return thunk(...arguments);
            }
        }

        await Promise.all([
            dispatch(toggleDrawer('cart')),
            dispatch(getCartDetails({ forceRefresh: true }))
        ]);
    };
};

export const getCartDetails = (payload = {}) => {
    const { forceRefresh } = payload;

    return async function thunk(dispatch, getState) {
        const { cart } = getState();
        const { guestCartId } = cart;

        dispatch(actions.getDetails.request(guestCartId));

        // if there isn't a guest cart, create one
        // then retry this operation
        if (!guestCartId) {
            await dispatch(createGuestCart());
            return thunk(...arguments);
        }

        try {
            const [imageCache, details, totals] = await Promise.all([
                retrieveImageCache(),
                fetchCartPart({ guestCartId, forceRefresh }),
                fetchCartPart({
                    guestCartId,
                    forceRefresh,
                    subResource: 'totals'
                })
            ]);

            const { items } = details;

            // for each item in the cart, look up its image in the cache
            // and merge it into the item object
            if (imageCache && Array.isArray(items) && items.length) {
                items.forEach(item => {
                    item.image = item.image || imageCache[item.sku] || {};
                });
            }

            dispatch(actions.getDetails.receive({ details, totals }));
        } catch (error) {
            const { response } = error;

            dispatch(actions.getDetails.receive(error));

            // check if the guest cart has expired
            if (response && response.status === 404) {
                // if so, create a new one
                await dispatch(createGuestCart());
                // then retry this operation
                return thunk(...arguments);
            }
        }
    };
};

export const toggleCart = () =>
    async function thunk(dispatch, getState) {
        const { app, cart } = getState();

        // ensure state slices are present
        if (!app || !cart) {
            return;
        }

        // if the cart drawer is open, close it
        if (app.drawer === 'cart') {
            return dispatch(closeDrawer());
        }

        // otherwise open the cart and load its contents
        await Promise.all([
            dispatch(toggleDrawer('cart')),
            dispatch(getCartDetails())
        ]);
    };

/* helpers */

async function fetchCartPart({ guestCartId, forceRefresh, subResource = '' }) {
    if (!guestCartId) {
        throw new Error('Missing required information: guestCartId');
    }

    return request(`/rest/V1/guest-carts/${guestCartId}/${subResource}`, {
        cache: forceRefresh ? 'reload' : 'default'
    });
}

export async function retrieveGuestCartId() {
    return storage.getItem('guestCartId');
}

export async function saveGuestCartId(id) {
    return storage.setItem('guestCartId', id);
}

export async function clearGuestCartId() {
    return storage.removeItem('guestCartId');
}

async function retrieveImageCache() {
    return storage.getItem('imagesBySku') || {};
}

async function saveImageCache(cache) {
    return storage.setItem('imagesBySku', cache);
}

async function writeImageToCache(item = {}) {
    const { media_gallery_entries: media, sku } = item;

    if (sku) {
        const image = media.find(m => m.position === 1) || media[0];

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
