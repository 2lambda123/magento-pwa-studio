import React, { useMemo } from 'react';

import { useCartPage } from '@magento/peregrine/lib/talons/CartPage/useCartPage';

import Button from '../Button';
import PriceSummary from './PriceSummary';
import { mergeClasses } from '../../classify';
import defaultClasses from './cartPage.css';

const CartPage = props => {
    const { handleSignIn, isSignedIn } = useCartPage();

    const classes = mergeClasses(defaultClasses, props.classes);

    const signInDisplay = useMemo(() => {
        return !isSignedIn ? (
            <Button
                className={classes.sign_in}
                onClick={handleSignIn}
                priority="high"
            >
                {'Sign In'}
            </Button>
        ) : null;
    }, [classes.sign_in, handleSignIn, isSignedIn]);

    return (
        <div className={classes.root}>
            <div className={classes.heading_container}>
                <h1 className={classes.heading}>Cart</h1>
                {signInDisplay}
            </div>
            <div className={classes.body}>
                <div className={classes.items_container}>
                    <a href="https://jira.corp.magento.com/browse/PWA-238">
                        Items List to be completed by PWA-238.
                    </a>
                </div>
                <div className={classes.price_adjustments_container}>
                    <a href="https://jira.corp.magento.com/browse/PWA-241">
                        Price Adjustments to be completed by PWA-241.
                    </a>
                </div>
                <div className={classes.summary_container}>
                    <div className={classes.summary_contents}>
                        <PriceSummary />
                    </div>
                </div>
                <div className={classes.recently_viewed_container}>
                    <a href="https://jira.corp.magento.com/browse/PWA-270">
                        Recently Viewed to be completed by PWA-270.
                    </a>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
