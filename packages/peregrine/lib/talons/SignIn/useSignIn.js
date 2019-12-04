import { useCallback, useRef, useState } from 'react';
import { useUserContext } from '../../context/user';
import { useMutation } from '@apollo/react-hooks';
import { useCartContext } from '../../context/cart';
import { useAwaitQuery } from '../../hooks/useAwaitQuery';

export const useSignIn = props => {
    const {
        setDefaultUsername,
        showCreateAccount,
        showForgotPassword,
        signInMutation,
        createCartMutation,
        customerQuery
    } = props;

    const [isSigningIn, setIsSigningIn] = useState(false);

    const [, { getCartDetails, removeCart }] = useCartContext();
    const [
        { isGettingDetails, getDetailsError },
        { getUserDetails, setToken }
    ] = useUserContext();

    const [signIn, { error: signInError }] = useMutation(signInMutation);
    const [fetchCartId] = useMutation(createCartMutation);
    const fetchUserDetails = useAwaitQuery(customerQuery);

    const errors = [];
    if (signInError) {
        errors.push(signInError.graphQLErrors[0]);
    }
    if (getDetailsError) {
        errors.push(getDetailsError);
    }

    const formRef = useRef(null);

    const handleSubmit = useCallback(
        async ({ email, password }) => {
            setIsSigningIn(true);
            try {
                // Sign in and save the token
                const response = await signIn({
                    variables: { email, password }
                });

                const token =
                    response && response.data.generateCustomerToken.token;

                await setToken(token);
                await getUserDetails({ fetchUserDetails });

                // Then remove the old, guest cart and get the cart id from gql.
                // TODO: This logic may be replacable with mergeCart in 2.3.4
                await removeCart();
                await getCartDetails({ forceRefresh: true, fetchCartId });
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error(error);
                }

                setIsSigningIn(false);
            }
        },
        [
            fetchCartId,
            fetchUserDetails,
            getCartDetails,
            getUserDetails,
            removeCart,
            setToken,
            signIn
        ]
    );

    const handleForgotPassword = useCallback(() => {
        const { current: form } = formRef;

        if (form) {
            setDefaultUsername(form.formApi.getValue('email'));
        }

        showForgotPassword();
    }, [setDefaultUsername, showForgotPassword]);

    const handleCreateAccount = useCallback(() => {
        const { current: form } = formRef;

        if (form) {
            setDefaultUsername(form.formApi.getValue('email'));
        }

        showCreateAccount();
    }, [setDefaultUsername, showCreateAccount]);

    return {
        errors,
        formRef,
        handleCreateAccount,
        handleForgotPassword,
        handleSubmit,
        isBusy: isGettingDetails || isSigningIn
    };
};
