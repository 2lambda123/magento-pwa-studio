/**
 * @deprecated Resolvers are deprecated in ApolloClient v3.
 *
 * Type resolvers are merged by the client so spread each resolver into a
 * separate object.
 *
 * NOTE: Be careful not to overwrite type properties. For example, suppose two
 * resolvers are spread into the array resulting in the following. "foo" will be
 * overwritten while "bar" and "baz" will not be.
 *
 * [
 *   { // From Component A resolvers
 *     Query: {
 *       foo: () => { return 1; }
 *       bar: () => { return 2; }
 *     }
 *   },
 *   { // From Component B resolvers
 *     Query: {
 *       foo: () => { return 3; }
 *       baz: () => { return 4; }
 *     }
 *   }
 * ]
 */

export default [];
