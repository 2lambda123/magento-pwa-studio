---
title: Venia theme setup
---

Venia is a PWA theme that runs on top of an existing Magento 2 backend.
Follow the instructions on this page to setup and install the [Venia PWA concept theme][] in your Magento 2 instance.

At the end of this tutorial, you will have a working copy of the Venia theme installed and running on top of Magento.
Use this setup to explore or develop Magento PWA components and themes.

If you experience problems with the project setup, see [Troubleshooting][] in the PWA Buildpack section.

## Prerequisites

* [NodeJS 8.x LTS][]
* [Node Package Manager][] (NPM)
* A [local development instance][] of Magento 2.3 or above.

  The steps outline in this tutorial have been verified and are known to work with the following setups:

  * Magento 2 installed using [valet-plus][]
  * [Vagrant Box for Magento 2 developers][]



## Step 1. Clone repository

Clone the [PWA Studio] repository into your development environment.

``` sh
git clone https://github.com/magento-research/pwa-studio.git
```

{: .bs-callout .bs-callout-info}
**Note:**
For this tutorial, the project location is the `/Users/magedev/pwa-studio` directory.

### Special instructions for virtual machine installations

If you are using a virtual machine, make sure it can access the new project directory and runs Magento 2.3.

For example, if you are using the [Vagrant Box for Magento 2 developers][], use the following steps to add a synced folder to the virtual machine and configure it to use Magento 2.3.

<details markdown="1">
<summary>Show steps</summary>

{: .bs-callout .bs-callout-tip}
**Tip:**
If you clone the PWA Studio project repo into the `magento2ce` directory of the Vagrant project, the project folder will already be visible to the Vagrant box and you can skip ahead to Step 3.

1. In the Vagrant box project directory, open the `Vagrantfile` and locate the following line:
   ```
   config.vm.synced_folder '.', '/vagrant', disabled: true
   ```
2. Above this line, add the following entry (substituting the project directory path with your own):
   ```
   config.vm.synced_folder '/Users/magedev/pwa-studio', '/Users/magedev/pwa-studio', type: "nfs", create: true
   ```
3. If your environment does not already use Magento 2.3, copy `etc/config.yaml.dist` as `etc/config.yml` and update the following line:
   ``` yml
   ce: "git@github.com:magento/magento2.git"
   ```
   to
   ``` yml
   ce: "https://github.com/magento/magento2.git::2.3-develop"
   ```
   And if you want to pull the sample data (optional), update:
   ``` yml
   ce_sample_data: "git@github.com:magento/magento2-sample-data.git"
   ```
   to
   ``` yml
   ce_sample_data: "https://github.com/magento/magento2-sample-data.git::2.3-develop"
   ```
4. In that same file, update the PHP version to 7.1 by updating the following line:
   ``` yml
   php_version: "7.0"
   ```
   to
   ``` yml
   php_version: "7.1"
   ```
5. Init or reset the Vagrant environment:
   ```
   bash init-project
   ```
   OR
   ```
   bash init_project.sh -f
   ```
</details>

## Step 2. Install PWA Studio dependencies

In the PWA Studio project's root directory, run the following command to install the project dependencies:

``` sh
npm install
```

## Step 3. Link and install module

Navigate to your Magento installation's `app/code/Magento` directory and create a `Pwa` symlink folder linking to the project's `module` directory.

**Example command:**
``` sh
ln -s /Users/magedev/pwa-studio/packages/pwa-module Pwa
```
Or from your Magento 2 root
``` sh
ln -s pwa-studio/packages/pwa-module app/code/Magento/Pwa
```

### Enable and install

Navigate to your Magento installation's root director and run the following command to enable the module:

``` sh
bin/magento module:enable Magento_Pwa
```

Install the module using the following command:
``` sh
bin/magento setup:upgrade
```

## Step 4. Link theme directory

Navigate to your Magento installation's `app/design/frontend/Magento` directory and create a `venia` symlink folder linking to the project's `theme-frontend-venia` directory.

**Example command:**
``` sh
ln -s /Users/magedev/pwa-studio/packages/venia-concept venia
```

## Step 5. Activate the Venia theme

Browse to the Admin section of your Magento store and configure it to use the **Magento Venia** theme.
You can find this configuration using the **Configuration** link in the **Content** tab.

## Step 6. Set environment variables

Under the Venia project's `theme-frontend-venia` directory, copy `.env.dist` into a new `.env` file and update the variables with the URL to your Magento development store.

**Example commands:**
``` sh
cd /Users/magedev/pwa-studio/packages/venia-concept
```
``` sh
cp .env.dist .env
```

## Step 7. Start the development server

Use the following command to start the development server:

``` sh
npm start
```

{: .bs-callout .bs-callout-info}
**Note:**
Some users have reported using `sudo npm start` to get around permissions.

After the development server is up and running, look for a similar line in the terminal output (the port will differ for your instance):

``` sh
Project is running at https://magento-venia.local.pwadev:8000/
```

This is the new address for your PWA frontend.
You can still use the old address to access the Admin section of Magento, but
for PWA development on the frontend, use this new address.

Congratulations! You have set up your development environment for the Venia theme project.

[Venia PWA concept theme]: https://github.com/magento-research/pwa-studio/tree/master/packages/venia-concept
[Node Package Manager]: https://www.npmjs.com/
[NodeJS 8.x LTS]: https://nodejs.org/en/
[Vagrant Box for Magento 2 developers]: https://github.com/paliarush/magento2-vagrant-for-developers
[Troubleshooting]: {{ site.baseurl }}{% link pwa-buildpack/troubleshooting/index.md %}
[PWA Studio]: https://github.com/magento-research/pwa-studio
[local development instance]: https://devdocs.magento.com/guides/v2.3/install-gde/bk-install-guide.html
[valet-plus]: https://github.com/weprovide/valet-plus