import { handleActions } from 'redux-actions';

import actions from 'src/actions/cart';
import checkoutActions from 'src/actions/checkout';

export const name = 'cart';

const initialState = {
    details: {},
    guestCartId: null,
    totals: {}
};

const reducerMap = {
    [actions.getGuestCart.receive]: (state, { payload, error }) => {
        if (error) {
            return state;
        }

        return {
            ...state,
            guestCartId: payload
        };
    },
    [actions.getDetails.receive]: (state, { payload, error }) => {
        if (error) {
            return state;
        }

        return {
            ...state,
            ...payload
        };
    },
    [checkoutActions.order.accept]: () => {
        return initialState;
    }
};

export default handleActions(reducerMap, initialState);
