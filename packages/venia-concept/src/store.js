import { createStore } from 'redux';

import enhancer from 'src/middleware';
import reducer from 'src/reducers';

import composeEnhancers from './composeEnhancers';

export default createStore(reducer, composeEnhancers(enhancer));
