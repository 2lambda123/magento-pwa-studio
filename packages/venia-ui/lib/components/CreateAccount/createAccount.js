import React, { useMemo } from 'react';
import { Redirect } from '@magento/venia-drivers';
import { func, shape, string } from 'prop-types';
import { Form } from 'informed';

import { mergeClasses } from '../../classify';
import Button from '../Button';
import Checkbox from '../Checkbox';
import Field from '../Field';
import TextInput from '../TextInput';
import combine from '../../util/combineValidators';
import {
    validateEmail,
    isRequired,
    validatePassword,
    validateConfirmPassword,
    hasLengthAtLeast
} from '../../util/formValidators';
import defaultClasses from './createAccount.css';
import { useUserContext } from '@magento/peregrine/lib/context/user';

const LEAD =
    'Check out faster, use multiple addresses, track orders and more by creating an account!';

const CreateAccount = props => {
    const { initialValues = {}, onSubmit } = props;

    const [
        { createAccountError, isCreatingAccount, isSignedIn }
    ] = useUserContext();
    const hasError = !!createAccountError;

    const classes = mergeClasses(defaultClasses, props.classes);
    const sanitizedInitialValues = useMemo(() => {
        const { email, firstName, lastName, ...rest } = initialValues;

        return {
            customer: { email, firstname: firstName, lastname: lastName },
            ...rest
        };
    }, [initialValues]);

    const errorMessage = hasError
        ? 'An error occurred. Please try again.'
        : null;

    if (isSignedIn) {
        return <Redirect to="/" />;
    }

    return (
        <Form
            className={classes.root}
            initialValues={sanitizedInitialValues}
            onSubmit={onSubmit}
        >
            <p className={classes.lead}>{LEAD}</p>
            <Field label="First Name" required={true}>
                <TextInput
                    field="customer.firstname"
                    autoComplete="given-name"
                    validate={isRequired}
                    validateOnBlur
                />
            </Field>
            <Field label="Last Name" required={true}>
                <TextInput
                    field="customer.lastname"
                    autoComplete="family-name"
                    validate={isRequired}
                    validateOnBlur
                />
            </Field>
            <Field label="Email" required={true}>
                <TextInput
                    field="customer.email"
                    autoComplete="email"
                    validate={combine([isRequired, validateEmail])}
                    validateOnBlur
                />
            </Field>
            <Field label="Password" required={true}>
                <TextInput
                    field="password"
                    type="password"
                    autoComplete="new-password"
                    validate={combine([
                        isRequired,
                        [hasLengthAtLeast, 8],
                        validatePassword
                    ])}
                    validateOnBlur
                />
            </Field>
            <Field label="Confirm Password" required={true}>
                <TextInput
                    field="confirm"
                    type="password"
                    validate={combine([isRequired, validateConfirmPassword])}
                    validateOnBlur
                />
            </Field>
            <div className={classes.subscribe}>
                <Checkbox
                    field="subscribe"
                    label="Subscribe to news and updates"
                />
            </div>
            <div className={classes.error}>{errorMessage}</div>
            <div className={classes.actions}>
                <Button
                    disabled={isCreatingAccount}
                    type="submit"
                    priority="high"
                >
                    {'Submit'}
                </Button>
            </div>
        </Form>
    );
};

CreateAccount.propTypes = {
    classes: shape({
        actions: string,
        error: string,
        lead: string,
        root: string,
        subscribe: string
    }),
    initialValues: shape({
        email: string,
        firstName: string,
        lastName: string
    }),
    onSubmit: func.isRequired
};

export default CreateAccount;
