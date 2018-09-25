import actions from '../actions';

const payload = 'PAYLOAD';
const error = new Error('ERROR');

test('addItem.request.toString() returns the proper action type', () => {
    expect(actions.addItem.request.toString()).toBe('CART/ADD_ITEM/REQUEST');
});

test('addItem.request() returns a proper action object', () => {
    expect(actions.addItem.request(payload)).toEqual({
        type: 'CART/ADD_ITEM/REQUEST',
        payload
    });
});

test('addItem.receive.toString() returns the proper action type', () => {
    expect(actions.addItem.receive.toString()).toBe('CART/ADD_ITEM/RECEIVE');
});

test('addItem.receive() returns a proper action object', () => {
    expect(actions.addItem.receive(payload)).toEqual({
        type: 'CART/ADD_ITEM/RECEIVE',
        payload
    });
    expect(actions.addItem.receive(error)).toEqual({
        type: 'CART/ADD_ITEM/RECEIVE',
        payload: error,
        error: true
    });
});

test('getGuestCart.request.toString() returns the proper action type', () => {
    expect(actions.getGuestCart.request.toString()).toBe(
        'CART/GET_GUEST_CART/REQUEST'
    );
});

test('getGuestCart.request() returns a proper action object', () => {
    expect(actions.getGuestCart.request(payload)).toEqual({
        type: 'CART/GET_GUEST_CART/REQUEST',
        payload
    });
});

test('getGuestCart.receive.toString() returns the proper action type', () => {
    expect(actions.getGuestCart.receive.toString()).toBe(
        'CART/GET_GUEST_CART/RECEIVE'
    );
});

test('getGuestCart.receive() returns a proper action object', () => {
    expect(actions.getGuestCart.receive(payload)).toEqual({
        type: 'CART/GET_GUEST_CART/RECEIVE',
        payload
    });
    expect(actions.getGuestCart.receive(error)).toEqual({
        type: 'CART/GET_GUEST_CART/RECEIVE',
        payload: error,
        error: true
    });
});

test('getDetails.request.toString() returns the proper action type', () => {
    expect(actions.getDetails.request.toString()).toBe(
        'CART/GET_DETAILS/REQUEST'
    );
});

test('getDetails.request() returns a proper action object', () => {
    expect(actions.getDetails.request(payload)).toEqual({
        type: 'CART/GET_DETAILS/REQUEST',
        payload
    });
});

test('getDetails.receive.toString() returns the proper action type', () => {
    expect(actions.getDetails.receive.toString()).toBe(
        'CART/GET_DETAILS/RECEIVE'
    );
});

test('getDetails.receive() returns a proper action object', () => {
    expect(actions.getDetails.receive(payload)).toEqual({
        type: 'CART/GET_DETAILS/RECEIVE',
        payload
    });
    expect(actions.getDetails.receive(error)).toEqual({
        type: 'CART/GET_DETAILS/RECEIVE',
        payload: error,
        error: true
    });
});
