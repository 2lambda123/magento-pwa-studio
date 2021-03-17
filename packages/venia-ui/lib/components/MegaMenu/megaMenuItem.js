import React from 'react';
import { Link, resourceUrl } from '../../drivers';
import { mergeClasses } from '../../classify';
import defaultClasses from './megaMenuItem.css';
import Submenu from './submenu';
import PropTypes from 'prop-types';

/**
 * The MegaMenuItem component displays mega menu item
 *
 * @param {MegaMenuCategory} props.category
 * @param {int} props.activeCategoryId - id of active category
 * @param {int} props.mainNavWidth - width of the main nav. It's used for setting min-width of the submenu
 */
const MegaMenuItem = props => {
    const { activeCategoryId, category, mainNavWidth } = props;
    const classes = mergeClasses(defaultClasses, props.classes);
    const categoryUrl = resourceUrl(
        `/${category.url_path}${category.url_suffix || ''}`
    );

    const children = category.children.length ? (
        <Submenu items={category.children} mainNavWidth={mainNavWidth} />
    ) : null;
    const isActive = category.id === activeCategoryId;

    return (
        <div className={classes.megaMenuItem}>
            <Link
                className={
                    isActive ? classes.megaMenuLinkActive : classes.megaMenuLink
                }
                to={categoryUrl}
            >
                {category.name}
            </Link>
            {children}
        </div>
    );
};

export default MegaMenuItem;

MegaMenuItem.propTypes = {
    category: PropTypes.shape({
        children: PropTypes.array,
        id: PropTypes.number.isRequired,
        include_in_menu: PropTypes.number,
        isActive: PropTypes.bool.isRequired,
        name: PropTypes.string.isRequired,
        path: PropTypes.array.isRequired,
        position: PropTypes.number.isRequired,
        url_path: PropTypes.string.isRequired,
        url_suffix: PropTypes.string
    }).isRequired,
    activeCategoryId: PropTypes.number,
    mainNavWidth: PropTypes.number.isRequired
};
