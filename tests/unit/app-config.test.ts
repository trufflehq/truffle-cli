import { describe, expect, it } from 'vitest';
import {
  convertActionConfigsToMothertreeActionConfigs,
  convertAppConfigToMothertreeConfig,
  convertProductConfigsToMothertreeProductAndVariantConfigs,
  validateAppConfig,
} from '../../src/util/app-config';

describe('app-config', () => {
  describe('validateAppConfig', () => {
    it('should allow a valid config', () => {
      const config = {
        path: '@truffle/test-app',
        name: 'test-app',
        cliVersion: '0.0.0',
        embeds: [
          {
            slug: 'test-embed',
            url: 'https://example.com',
            contentPageType: 'youtubeVideo',
          },
        ],
        countables: [
          {
            slug: 'channel-points',
            name: 'Channel Points',
            category: 'currency-virtual',
            decimalPlaces: 0,
          },
        ],
        products: [
          {
            slug: 'test-product',
            name: 'Test Product',
            category: 'test-category',
            variants: [
              {
                slug: 'test-variant',
                price: 100,
              },
            ],
          },
        ],
      };

      expect(validateAppConfig(config)).toMatchSnapshot();
    });

    it('should throw an error for an invalid config', () => {
      const config = {
        path: '@truffle/test-app',
        name: 'test-app',
        // missing cliVersion
      };

      expect(() => validateAppConfig(config)).toThrowErrorMatchingSnapshot();
    });
  });

  describe('convertActionConfigsToMothertreeActionConfigs', () => {
    it('should convert a basic webhook action', () => {
      const actionConfigs = [
        {
          slug: 'test-action',
          operation: 'test-operation',
          url: 'https://example.com',
        },
      ];
      const mtAppConfig = {
        actions: [],
      };

      convertActionConfigsToMothertreeActionConfigs(actionConfigs, mtAppConfig);

      expect(mtAppConfig.actions).toMatchSnapshot();
    });

    it('should convert a basic workflow action', () => {
      const actionConfigs = [
        {
          slug: 'test-action',
          operation: 'workflow',
          strategy: 'sequential',
          actions: [
            './_Action/action-1',
            {
              slug: 'action-2',
              operation: 'test-operation',
              url: 'https://example.com',
            },
          ],
        },
      ];
      const mtAppConfig = {
        actions: [],
      };

      convertActionConfigsToMothertreeActionConfigs(actionConfigs, mtAppConfig);

      expect(mtAppConfig.actions).toMatchSnapshot();
    });
  });

  describe('convertProductConfigsToMothertreeProductAndVariantConfigs', () => {
    it('should convert a basic product', () => {
      const productConfigs = [
        {
          slug: 'test-product',
          name: 'Test Product',
          category: 'test-category',
          variants: [
            {
              slug: 'test-variant',
              price: 100,
            },
          ],
        },
      ];
      const mtAppConfig = {
        products: [],
        productVariants: [],
        actions: [],
      };

      convertProductConfigsToMothertreeProductAndVariantConfigs(
        productConfigs,
        mtAppConfig,
      );

      expect(mtAppConfig).toMatchSnapshot();
    });

    it('should convert a product with a variant with an action', () => {
      const productConfigs = [
        {
          slug: 'test-product',
          name: 'Test Product',
          category: 'test-category',
          variants: [
            {
              slug: 'test-variant',
              price: 100,
              action: {
                slug: 'test-action',
                operation: 'webhook',
                url: 'https://example.com',
              },
            },
          ],
        },
      ];
      const mtAppConfig = {
        products: [],
        productVariants: [],
        actions: [],
      };

      convertProductConfigsToMothertreeProductAndVariantConfigs(
        productConfigs,
        mtAppConfig,
      );

      expect(mtAppConfig).toMatchSnapshot();
    });
  });

  describe('convertAppConfigToMothertreeConfig', () => {
    it('should convert a basic app config', () => {
      const appConfig = {
        path: '@truffle/test-app',
        name: 'test-app',
        cliVersion: '0.0.0',
        embeds: [
          {
            slug: 'test-embed',
            url: 'https://example.com',
            contentPageType: 'youtubeVideo',
          },
        ],
        actions: [
          {
            slug: 'test-action',
            operation: 'webhook',
            url: 'https://example.com',
          },
        ],
        countables: [
          {
            slug: 'channel-points',
            name: 'Channel Points',
            category: 'currency-virtual',
            decimalPlaces: 0,
          },
        ],
        products: [
          {
            slug: 'test-product',
            name: 'Test Product',
            category: 'test-category',
            variants: [
              {
                slug: 'test-variant',
                price: 100,
              },
            ],
          },
        ],
      };

      expect(convertAppConfigToMothertreeConfig(appConfig)).toMatchSnapshot();
    });
  });
});
