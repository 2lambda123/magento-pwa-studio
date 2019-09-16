import { connect } from '@magento/venia-drivers';
import { addItemToCart } from '@magento/peregrine/lib/store/actions/cart';
import ProductFullDetail from './productFullDetail';

const mapDispatchToProps = {
    addItemToCart
};

const mapStateToProps = ({ cart }) => {
    return {
        isAddingItem: cart.isAddingItem
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ProductFullDetail);
