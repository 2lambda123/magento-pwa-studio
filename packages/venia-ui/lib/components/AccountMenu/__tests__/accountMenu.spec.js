import React from 'react';
import { createTestInstance } from '@magento/peregrine';

import { useAccountMenu } from '@magento/peregrine/lib/talons/Header/useAccountMenu';

import AccountMenu from '../accountMenu';

jest.mock('../accountMenuItems', () => 'AccountMenuItems');
jest.mock('../../SignIn/signIn', () => 'SignIn Component');

jest.mock('@magento/peregrine/lib/talons/Header/useAccountMenu', () => ({
    useAccountMenu: jest.fn().mockReturnValue({
        view: 'ACCOUNT',
        username: 'gooseton',
        handleSignOut: jest.fn(),
        handleForgotPassword: jest.fn(),
        handleCreateAccount: jest.fn(),
        updateUsername: jest.fn()
    })
}));

const defaultTalonProps = {
    view: 'ACCOUNT',
    username: 'gooseton',
    handleSignOut: jest.fn(),
    handleForgotPassword: jest.fn(),
    handleCreateAccount: jest.fn(),
    updateUsername: jest.fn()
};

const defaultProps = {
    accountMenuIsOpen: false,
    setAccountMenuIsOpen: jest.fn(),
    classes: {
        modal_active: 'modal_active_class'
    }
};

test('it renders AccountMenuItems when the user is signed in', () => {
    useAccountMenu.mockReturnValueOnce({
        ...defaultTalonProps,
        view: 'ACCOUNT'
    });

    // Act.
    const instance = createTestInstance(<AccountMenu {...defaultProps} />);

    // Assert.
    expect(instance.toJSON()).toMatchSnapshot();
});

test('it renders SignIn component when the view is SIGNIN', () => {
    useAccountMenu.mockReturnValueOnce({
        ...defaultTalonProps,
        view: 'SIGNIN'
    });

    // Act.
    const instance = createTestInstance(<AccountMenu {...defaultProps} />);

    // Assert.
    expect(instance.toJSON()).toMatchSnapshot();
});

test('it renders forgot password component when the view is FORGOT_PASSWORD', () => {
    useAccountMenu.mockReturnValueOnce({
        ...defaultTalonProps,
        view: 'FORGOT_PASSWORD'
    });

    // Act.
    const instance = createTestInstance(<AccountMenu {...defaultProps} />);

    // Assert.
    expect(instance.toJSON()).toMatchSnapshot();
});

test('it renders forgot password component when the view is CREATE_ACCOUNT', () => {
    useAccountMenu.mockReturnValueOnce({
        ...defaultTalonProps,
        view: 'CREATE_ACCOUNT'
    });

    // Act.
    const instance = createTestInstance(<AccountMenu {...defaultProps} />);

    // Assert.
    expect(instance.toJSON()).toMatchSnapshot();
});
