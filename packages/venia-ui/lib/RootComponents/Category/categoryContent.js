import React, { Fragment, useCallback } from 'react';
import { shape, string } from 'prop-types';

import { Title } from '../../components/Head';
import { mergeClasses } from '../../classify';
import FilterModal from '../../components/FilterModal';
import Gallery from '../../components/Gallery';
import Pagination from '../../components/Pagination';
import defaultClasses from './category.css';
import { useAppContext } from '@magento/peregrine/lib/context/app';

const CategoryContent = props => {
    const [, { toggleDrawer }] = useAppContext();

    const handleOpenFilters = useCallback(() => {
        toggleDrawer('filter');
    }, [toggleDrawer]);

    const { data, pageControl, pageSize } = props;
    const classes = mergeClasses(defaultClasses, props.classes);
    const filters = data ? data.products.filters : null;
    const items = data ? data.products.items : null;
    const title = data ? data.category.name : null;
    const titleContent = title ? `${title} - Venia` : 'Venia';

    const header = filters ? (
        <div className={classes.headerButtons}>
            <button
                className={classes.filterButton}
                onClick={handleOpenFilters}
                type="button"
            >
                {'Filter'}
            </button>
        </div>
    ) : null;

    const modal = filters ? <FilterModal filters={filters} /> : null;
    return (
        <Fragment>
            <Title>{titleContent}</Title>
            <article className={classes.root}>
                <h1 className={classes.title}>
                    <div className={classes.categoryTitle}>{title}</div>
                </h1>
                {header}
                <section className={classes.gallery}>
                    <Gallery data={items} pageSize={pageSize} />
                </section>
                <div className={classes.pagination}>
                    <Pagination pageControl={pageControl} />
                </div>
                {modal}
            </article>
        </Fragment>
    );
};

export default CategoryContent;

CategoryContent.propTypes = {
    classes: shape({
        filterContainer: string,
        gallery: string,
        headerButtons: string,
        pagination: string,
        root: string,
        title: string
    })
};
