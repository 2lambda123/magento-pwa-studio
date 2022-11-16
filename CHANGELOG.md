# PWA Studio Release 12.7.0

**NOTE:**
_This changelog only contains release notes for PWA Studio and Venia 12.7.0_.
_For older release notes, see_ [PWA Studio releases][].

## Highlights

The 12.7.0 release of PWA Studio provides customers with a better product selection experience by showing which variations of a configurable product are out of stock. This addition prevents customers from selecting out of stock variations when configuring a product for purchase.

This release also adds and improves several keyboard and screen-reader accessibility features along with user session and permission bug fixes. Full details are described below.

## New Features

- **Out-of-stock for product variations** [3903][] — The out-of-stock setting can now be applied to configurable product variations, making it easier for customers to configure a product with the available variations.
- **Tailwind theming documentation** [155][] — New instructions on how to install, configure, and use Tailwind with Venia to theme your own PWA Studio app. See [Tailwind Theming for PWA Studio apps](https://developer.adobe.com/commerce/pwa-studio/guides/theming/).
- **Accessible Action menus** [3791][] — Action menu functions are now accessible by keyboard.
- **Accessible Search results content** [3891][] —Screen reading of search results has been improved.
- **Accessible Search results count** [3935][] — Screen reader announces the total items found in the searched result.
- **Accessible UI Control states** [3792][] — Screen readers now announce the expanded and collapsed states of controls.
- **Accessible Mega Menu** [3798][] — The Mega Menu is now accessible by keyboard.
- **Accessible Actionable UI elements** [3864][] — When actionable UI elements receive focus, a visible focus indicator is present.
- **Accessible Logo component** [3936][] — The Logo component now renders the `alt` property.

## Bug Fixes

- **Fixed selected payment method** [3969][] — The selected payment method now persists during the user session, when multiple payment methods are available.
- **Fixed permission error** [3955][] — Fixed a permission error that occurred during the compilation process initiated by Docker.
- **Fixed import typo** [3648][] — Fixed a typo for the import name of a component.
- **Fixed console warnings** [3942][] — Fixed console warnings for invalid DOM property names.

## 12.7.0 Lighthouse scores

With each new release of PWA Studio, we perform Lighthouse audits of four Venia page types, each representing a different level of complexity. Shown below are the Lighthouse scores for the 12.7.0 release of these pages on desktop and mobile devices.

### Desktop scores

|               | Home Page | Product Category | Product Details | Search Results |
| ------------: | :---------------: | :---------------: | :---------------: | :---------------: |
| **Desktop** | ![](images/venia_page_home.png) | ![](images/venia_page_category.png) | ![](images/venia_page_details.png) | ![](images/venia_page_search.png) |
| Performance | ![](images/score_88.svg) | ![](images/score_94.svg) | ![](images/score_63.svg) | ![](images/score_96.svg) |
| Accessibility | ![](images/score_100.svg) | ![](images/score_100.svg) | ![](images/score_100.svg) | ![](images/score_100.svg) | ![](images/score_100.svg) |
| Best Practices | ![](images/score_100.svg) | ![](images/score_100.svg) | ![](images/score_100.svg) | ![](images/score_100.svg) | ![](images/score_100.svg) |
| SEO | ![](images/score_100.svg) | ![](images/score_100.svg) | ![](images/score_100.svg) | ![](images/score_100.svg) | ![](images/score_100.svg) |
| PWA | ![](images/pwa_perfect.svg) | ![](images/pwa_perfect.svg) | ![](images/pwa_perfect.svg) | ![](images/pwa_perfect.svg) | ![](images/pwa_perfect.svg) |

### Mobile scores

|               | &nbsp;&nbsp;Home Page&nbsp;&nbsp; | Product Category | Product Details | Search Results |
| ------------: | :---------------: | :---------------: | :---------------: | :---------------: |
| **Mobile** | ![](images/venia_page_home.png) | ![](images/venia_page_category.png) | ![](images/venia_page_details.png) | ![](images/venia_page_search.png) |
| Performance | ![](images/score_23.svg) | ![](images/score_34.svg) | ![](images/score_27.svg) | ![](images/score_39.svg) |
| Accessibility | ![](images/score_100.svg) | ![](images/score_100.svg) | ![](images/score_100.svg) | ![](images/score_100.svg) |
| Best Practices | ![](images/score_100.svg) | ![](images/score_100.svg) | ![](images/score_100.svg) | ![](images/score_100.svg) |
| SEO | ![](images/score_100.svg) | ![](images/score_100.svg) | ![](images/score_100.svg) | ![](images/score_100.svg) |
| PWA | ![](images/pwa_perfect.svg) | ![](images/pwa_imperfect.svg) | ![](images/pwa_imperfect.svg) | ![](images/pwa_perfect.svg) |

## Known issue

When a user logs out, that user's local storage session persists. As a result, the cart ID from the logged out user is retrieved and given to the _guest user_ on the computer. This causes the following error when the guest user tries to check out: `An error has occurred. Please check the input and try again.` To resolve this issue, try disabling graphql session sharing as described in the GraphQL documentation on session cookies here: https://devdocs.magento.com/guides/v2.4/graphql/authorization-tokens.html#session-cookies.

## Upgrading from a previous version

Use the steps outlined in this section to update your [scaffolded project][] from 12.6.0 to 12.7.0.
See [Upgrading versions][] for more information about upgrading between PWA Studio versions.

[scaffolded project]: https://developer.adobe.com/commerce/pwa-studio/tutorials/
[upgrading versions]: https://developer.adobe.com/commerce/pwa-studio/guides/upgrading-versions/

### Updated package dependencies

Open your `package.json` file and update the PWA Studio package dependencies to the versions associated with this release.
The following table lists the latest versions of each package as of 12.7.0. The **bolded** versions with an asterisk (*) are the packages that were updated from PWA Studio 12.6.0.

**Note:**
Your project may not depend on some packages listed in this table.

| Package                             | Latest version |
|-------------------------------------|----------------|
| `babel-preset-peregrine`            | **1.2.2***      |
| `create-pwa`                        | **2.3.3***      |
| `experience-platform-connector`     | **1.0.2***      |
| `upward-security-headers`           | **1.0.11***     |
| `venia-sample-backends`             | **0.0.9***      |
| `venia-sample-eventing`             | **0.0.3***      |
| `venia-sample-language-packs`       | **0.0.11***     |
| `venia-sample-payments-checkmo`     | **0.0.9***      |
| `pagebuilder`                       | **7.4.2***      |
| `peregrine`                         | **12.6.0***     |
| `pwa-buildpack`                     | **11.4.1***     |
| `pwa-theme-venia`                   | **1.4.0***      |
| `upward-js`                         | 5.3.2      |
| `upward-spec`                       | 5.2.1      |
| `venia-concept`                     | **12.7.0***     |
| `venia-ui`                          | **9.7.0***      |
| `magento2-pwa`                      | 0.3.0      |
| `magento2-pwa-commerce`             | 0.0.2      |
| `magento-venia-sample-data-modules` | 0.0.3      |
| `magento-venia-sample-data-modules-ee`| 0.0.2    |
| `magento2-upward-connector`         | 2.0.1      |
| `upward-php`                        | 2.0.1      |

[PWA Studio releases]: https://github.com/magento/pwa-studio/releases
[155]: https://github.com/AdobeDocs/commerce-pwa-studio/pull/155
[3791]: https://github.com/magento/pwa-studio/pull/3791
[3903]: https://github.com/magento/pwa-studio/pull/3903
[3798]: https://github.com/magento/pwa-studio/pull/3798
[3792]: https://github.com/magento/pwa-studio/pull/3792
[3891]: https://github.com/magento/pwa-studio/pull/3891
[3864]: https://github.com/magento/pwa-studio/pull/3864
[3935]: https://github.com/magento/pwa-studio/pull/3935
[3942]: https://github.com/magento/pwa-studio/pull/3942
[3648]: https://github.com/magento/pwa-studio/pull/3648
[3955]: https://github.com/magento/pwa-studio/pull/3955
[3969]: https://github.com/magento/pwa-studio/pull/3969
[3936]: https://github.com/magento/pwa-studio/pull/3936
