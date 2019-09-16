import React, { Fragment, useCallback, useState } from 'react';
import { func, shape, string } from 'prop-types';

import { generateSrcset } from '../../util/images';
import { mergeClasses } from '../../classify';
import defaultClasses from './image.css';

/**
 * The Image component renders a placeholder until the image is loaded.
 * @param {string} prop.alt the alt text for the image
 * @param {string} props.classes any classes to apply to this component
 * @param {string} prop.placeholder the placeholder source to display while the image loads or if it errors on load
 * @param {string} props.src the source of the image
 * @param {string} props.fileSrc the raw source of the image without width and height added
 */
const Image = props => {
    const { alt, onError, onLoad, placeholder, src, fileSrc, ...rest } = props;
    const classes = mergeClasses(defaultClasses, props.classes);

    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState();

    const handleImageLoad = useCallback(() => {
        setIsLoaded(true);

        if (typeof onLoad === 'function') {
            onLoad();
        }
    }, [onLoad]);

    const handleError = useCallback(() => {
        setError(true);

        if (typeof onError === 'function') {
            onError();
        }
    }, [onError]);

    // Render a placeholder until the image is loaded.
    const placeholderImage = placeholder && !isLoaded && (
        <img className={classes.root} src={placeholder} alt={alt} {...rest} />
    );

    const imageClass =
        classes.root + ' ' + (isLoaded ? classes.loaded : classes.notLoaded);

    const imageSrcset = generateSrcset(fileSrc, 'image-product');

    const actualImage = !error && (
        <img
            {...rest}
            alt={alt}
            className={imageClass}
            onError={handleError}
            onLoad={handleImageLoad}
            src={src}
            srcSet={imageSrcset}
        />
    );

    return (
        <Fragment>
            {actualImage}
            {placeholderImage}
        </Fragment>
    );
};

Image.propTypes = {
    alt: string,
    classes: shape({
        loaded: string,
        notLoaded: string,
        root: string
    }),
    onError: func,
    onLoad: func,
    placeholder: string,
    src: string,
    fileSrc: string
};

export default Image;
