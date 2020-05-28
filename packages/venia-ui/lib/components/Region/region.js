import React from 'react';
import { func, shape, string } from 'prop-types';
import { useRegion } from '@magento/peregrine/lib/talons/Region/useRegion';

import { mergeClasses } from '../../classify';
import Field from '../Field';
import Select from '../Select';
import TextInput from '../TextInput';
import defaultClasses from './region.css';
import { GET_REGIONS_QUERY } from './region.gql';

/**
 * Form component for Region that is seeded with backend data.
 *
 * @param {string} props.optionValueKey - Key to use for returned option values. In a future release, this will be removed and hard-coded to use "id" once GraphQL has resolved MC-30886.
 */
const Region = props => {
    const {
        classes: propClasses,
        field,
        label,
        validate,
        initialValue,
        optionValueKey,
        ...inputProps
    } = props;

    const talonProps = useRegion({
        optionValueKey,
        queries: { getRegionsQuery: GET_REGIONS_QUERY }
    });
    const { regions } = talonProps;

    const classes = mergeClasses(defaultClasses, propClasses);
    const regionProps = {
        field,
        validate,
        initialValue,
        classes,
        ...inputProps
    };

    const regionField = regions.length ? (
        <Select {...regionProps} items={regions} />
    ) : (
        <TextInput {...regionProps} />
    );

    return (
        <Field id={field} label={label} classes={{ root: classes.root }}>
            {regionField}
        </Field>
    );
};

export default Region;

Region.defaultProps = {
    field: 'region',
    label: 'State',
    optionValueKey: 'code'
};

Region.propTypes = {
    classes: shape({
        root: string
    }),
    field: string,
    label: string,
    optionValueKey: string,
    validate: func,
    initialValue: string
};
