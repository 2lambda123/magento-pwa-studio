import { Component, createElement } from 'react';
import PropTypes from 'prop-types';

import classify from 'src/classify';
import Icon from 'src/components/Icon';
import Tile from './tile';
import Trigger from './trigger';
import defaultClasses from './navigation.css';

const CATEGORIES = [
    'dresses',
    'tops',
    'bottoms',
    'skirts',
    'swim',
    'outerwear',
    'shoes',
    'jewelry',
    'accessories'
];

const tiles = CATEGORIES.map(category => (
    <Tile key={category} text={category} />
));

class Navigation extends Component {
    static propTypes = {
        classes: PropTypes.shape({
            root: PropTypes.string
        }),
        isOpen: PropTypes.bool
    };

    render() {
        const { classes, isOpen } = this.props;
        const className = isOpen ? classes.open : classes.closed;

        return (
            <aside className={className}>
                <div className={classes.header}>
                    <h2 className={classes.title}>
                        <span>Main Menu</span>
                    </h2>
                    <Trigger>
                        <Icon name="x" />
                    </Trigger>
                </div>
                <nav className={classes.tiles}>{tiles}</nav>
                <ul className={classes.items}>
                    <li className={classes.item}>
                        <span className={classes.link}>
                            <Icon name="user" />
                        </span>
                    </li>
                    <li className={classes.item}>
                        <span className={classes.link}>
                            <Icon name="heart" />
                        </span>
                    </li>
                    <li className={classes.item}>
                        <span className={classes.link}>
                            <Icon name="map-pin" />
                        </span>
                    </li>
                </ul>
            </aside>
        );
    }
}

export default classify(defaultClasses)(Navigation);
