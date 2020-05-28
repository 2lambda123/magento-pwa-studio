import { useCallback, useState } from 'react';
import {
    useApolloClient,
    useLazyQuery,
    useMutation,
    useQuery
} from '@apollo/react-hooks';

import { useAppContext } from '../../context/app';
import { useUserContext } from '../../context/user';
import { useCartContext } from '../../context/cart';
import { clearCartDataFromCache } from '../../Apollo/clearCartDataFromCache';

export const CHECKOUT_STEP = {
    SHIPPING_ADDRESS: 1,
    SHIPPING_METHOD: 2,
    PAYMENT: 3,
    REVIEW: 4
};

export const useCheckoutPage = props => {
    const {
        mutations: { createCartMutation, placeOrderMutation },
        queries: {
            getCheckoutDetailsQuery,
            getCustomerQuery,
            getOrderDetailsQuery
        }
    } = props;

    const [reviewOrderButtonClicked, setReviewOrderButtonClicked] = useState(
        false
    );

    const apolloClient = useApolloClient();
    const [isUpdating, setIsUpdating] = useState(false);
    const [activeContent, setActiveContent] = useState('checkout');
    const [checkoutStep, setCheckoutStep] = useState(
        CHECKOUT_STEP.SHIPPING_ADDRESS
    );
    const [, { toggleDrawer }] = useAppContext();
    const [{ isSignedIn }] = useUserContext();
    const [{ cartId }, { createCart, removeCart }] = useCartContext();

    const [fetchCartId] = useMutation(createCartMutation);
    const [
        placeOrder,
        {
            data: placeOrderData,
            error: placeOrderError,
            loading: placeOrderLoading
        }
    ] = useMutation(placeOrderMutation);

    const [
        getOrderDetails,
        { data: orderDetailsData, loading: orderDetailsLoading }
    ] = useLazyQuery(getOrderDetailsQuery, {
        // We use this query to fetch details _just_ before submission, so we
        // want to make sure it is fresh. We also don't want to cache this data
        // because it may contain PII.
        fetchPolicy: 'network-only'
    });

    const { data: customerData, loading: customerLoading } = useQuery(
        getCustomerQuery,
        { skip: !isSignedIn }
    );

    const {
        data: checkoutData,
        called: checkoutCalled,
        loading: checkoutLoading
    } = useQuery(getCheckoutDetailsQuery, {
        skip: !cartId,
        variables: {
            cartId
        }
    });

    const customer = customerData && customerData.customer;

    const toggleActiveContent = useCallback(() => {
        const nextContentState =
            activeContent === 'checkout' ? 'addressBook' : 'checkout';
        setActiveContent(nextContentState);
    }, [activeContent]);

    const handleSignIn = useCallback(() => {
        // TODO: set navigation state to "SIGN_IN". useNavigation:showSignIn doesn't work.
        toggleDrawer('nav');
    }, [toggleDrawer]);

    const handleReviewOrder = useCallback(() => {
        setReviewOrderButtonClicked(true);
    }, []);

    const resetReviewOrderButtonClicked = useCallback(() => {
        setReviewOrderButtonClicked(false);
    }, [setReviewOrderButtonClicked]);

    const setShippingInformationDone = useCallback(() => {
        if (checkoutStep === CHECKOUT_STEP.SHIPPING_ADDRESS) {
            setCheckoutStep(CHECKOUT_STEP.SHIPPING_METHOD);
        }
    }, [checkoutStep, setCheckoutStep]);

    const setShippingMethodDone = useCallback(() => {
        if (checkoutStep === CHECKOUT_STEP.SHIPPING_METHOD) {
            setCheckoutStep(CHECKOUT_STEP.PAYMENT);
        }
    }, [checkoutStep, setCheckoutStep]);

    const setPaymentInformationDone = useCallback(() => {
        if (checkoutStep === CHECKOUT_STEP.PAYMENT) {
            setCheckoutStep(CHECKOUT_STEP.REVIEW);
        }
    }, [checkoutStep, setCheckoutStep]);

    const handlePlaceOrder = useCallback(async () => {
        try {
            await getOrderDetails({
                variables: {
                    cartId
                }
            });
            await placeOrder({
                variables: {
                    cartId
                }
            });

            await removeCart();

            await clearCartDataFromCache(apolloClient);

            await createCart({
                fetchCartId
            });
        } catch (err) {
            console.error(
                'An error occurred during when placing the order',
                err
            );
            setReviewOrderButtonClicked(false);
            setCheckoutStep(CHECKOUT_STEP.PAYMENT);
            // TODO: Delete nonce? The nonce might be expired and why the order
            // failed. If we delete it the payment info section will render as
            // if it was not filled, thus prompting the user to enter new info.
        }
    }, [
        apolloClient,
        cartId,
        createCart,
        fetchCartId,
        getOrderDetails,
        placeOrder,
        removeCart
    ]);

    return {
        activeContent,
        checkoutStep,
        customer,
        error: placeOrderError,
        handleSignIn,
        handlePlaceOrder,
        hasError: !!placeOrderError,
        isCartEmpty: !(checkoutData && checkoutData.cart.total_quantity),
        isGuestCheckout: !isSignedIn,
        isLoading:
            !checkoutCalled ||
            (checkoutCalled && checkoutLoading) ||
            customerLoading,
        isUpdating,
        orderDetailsData,
        orderDetailsLoading,
        orderNumber:
            (placeOrderData && placeOrderData.placeOrder.order.order_number) ||
            null,
        placeOrderLoading,
        setCheckoutStep,
        setIsUpdating,
        setShippingInformationDone,
        setShippingMethodDone,
        setPaymentInformationDone,
        resetReviewOrderButtonClicked,
        handleReviewOrder,
        reviewOrderButtonClicked,
        toggleActiveContent
    };
};
