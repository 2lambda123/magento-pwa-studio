import React, { Fragment } from 'react';
import { arrayOf, oneOfType, node, shape, string } from 'prop-types';
import { BasicRadioGroup, asField } from 'informed';

import { mergeClasses } from '../../classify';
import { Message } from '../Field';
import Radio from './radio';
import defaultClasses from './radioGroup.css';

const RadioGroup = props => {
    const { classes: propClasses, fieldState, items, message, ...rest } = props;

    const classes = mergeClasses(defaultClasses, propClasses);

    const options = items.map(({ label, value }) => (
        <Radio
            classes={{
                label: classes.radioLabel,
                root: classes.radioContainer
            }}
            key={value}
            label={label}
            value={value}
        />
    ));

    return (
        <Fragment>
            <div className={classes.root}>
                <BasicRadioGroup {...rest} fieldState={fieldState}>
                    {options}
                </BasicRadioGroup>
            </div>
            <Message className={classes.message} fieldState={fieldState}>
                {message}
            </Message>
        </Fragment>
    );
};

export default asField(RadioGroup);

RadioGroup.propTypes = {
    classes: shape({
        message: string,
        radio: string,
        radioLabel: string,
        root: string
    }),
    fieldState: shape({
        value: string
    }),
    items: arrayOf(
        shape({
            label: oneOfType([string, node]),
            value: string
        })
    ),
    message: node
};
