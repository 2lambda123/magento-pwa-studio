const fetch = require('node-fetch');
const graphQLQueries = require('../queries');
const https = require('https');

// To be used with `node-fetch` in order to allow self-signed certificates.
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const fetchQuery = query => {
    const targetURL = new URL('graphql', process.env.MAGENTO_BACKEND_URL);

    return fetch(targetURL.toString(), {
        agent: targetURL.protocol === 'https:' ? httpsAgent : null,
        body: JSON.stringify({ query }),
        headers: {
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip'
        },
        method: 'POST'
    })
        .then(result => result.json())
        .then(json => json.data)
        .catch(err => {
            console.error(err);
            throw err;
        });
};

/**
 * An Async function that will asynchronously fetch the
 * media backend Url from magento graphql server.
 *
 * @returns Promise that will resolve to the media backend url.
 */
const getMediaURL = () => {
    return fetchQuery(graphQLQueries.getMediaUrl).then(
        data => data.storeConfig.secure_base_media_url
    );
};

/**
 * Get the schema's types.
 */
const getSchemaTypes = () => {
    return fetchQuery(graphQLQueries.getSchemaTypes);
};

/**
 * Get only the Union and Interface types in the schema.
 */
const getUnionAndInterfaceTypes = () => {
    return getSchemaTypes().then(data => {
        // Filter out any type information unrelated to unions or interfaces.
        const relevantData = data.__schema.types.filter(type => {
            return type.possibleTypes !== null;
        });

        data.__schema.types = relevantData;

        return data;
    });
};

/**
 * Generate, from schema, the possible types.
 *
 * https://www.apollographql.com/docs/react/data/fragments/#generating-possibletypes-automatically
 * @returns {Object}  This object maps the name of an interface or union type (the supertype) to the types that implement or belong to it (the subtypes).
 */
const getPossibleTypes = async () => {
    const data = await getSchemaTypes();

    const possibleTypes = {};

    data.__schema.types.forEach(supertype => {
        if (supertype.possibleTypes) {
            possibleTypes[supertype.name] = supertype.possibleTypes.map(
                subtype => subtype.name
            );
        }
    });

    return possibleTypes;
};

module.exports = {
    getMediaURL,
    getPossibleTypes,
    getSchemaTypes,
    getUnionAndInterfaceTypes
};
