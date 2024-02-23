import { it, describe, expect } from 'vitest';
import * as schemas from '../src/constants/app-config-schema';
import Joi from 'joi';

describe('app-config-schema', () => {
  describe('EMBED_SCHEMA', () => {
    it('should allow the minimum embed config', () => {
      const embed = {
        slug: 'test-embed',
        url: 'https://example.com',
        contentPageType: 'youtubeVideo',
      };

      Joi.assert(embed, schemas.EMBED_SCHEMA);
    });

    it('should throw an error if the embed config is empty', () => {
      expect(() =>
        Joi.assert({}, schemas.EMBED_SCHEMA)
      ).toThrowErrorMatchingSnapshot();
    });

    it('should throw an error if contentPageType is invalid', () => {
      const embed = {
        slug: 'test-embed',
        url: 'https://example.com',
        contentPageType: 'invalidType',
      };

      expect(() =>
        Joi.assert(embed, schemas.EMBED_SCHEMA)
      ).toThrowErrorMatchingSnapshot();
    });

    it('should allow the `windowProps` field', () => {
      const embed = {
        slug: 'test-embed',
        url: 'https://example.com',
        contentPageType: 'youtubeVideo',
        windowProps: {},
      };

      Joi.assert(embed, schemas.EMBED_SCHEMA);
    });

    it('should allow any styles in `defaultStyles`', () => {
      const embed = {
        slug: 'test-embed',
        url: 'https://example.com',
        contentPageType: 'youtubeVideo',
        defaultStyles: {
          backgroundColor: 'red',
          color: 'white',
        },
      };

      Joi.assert(embed, schemas.EMBED_SCHEMA);
    });
  });

  describe('PRODUCT_SCHEMA', () => {
    it('should allow the minimum product config', () => {
      const product = {
        slug: 'test-product',
        variants: [
          {
            slug: 'test-variant',
            price: 10,
          },
        ],
      };

      Joi.assert(product, schemas.PRODUCT_SCHEMA);
    });

    it('should allow a product variant with an action', () => {
      const product = {
        slug: 'test-product',
        variants: [
          {
            slug: 'test-variant',
            price: 10,
            action: {
              operation: 'webhook',
              url: 'https://example.com/webhook',
            },
          },
        ],
      };

      Joi.assert(product, schemas.PRODUCT_SCHEMA);
    });

    it('should throw an error if an action is defined without a url', () => {
      const product = {
        slug: 'test-product',
        variants: [
          {
            slug: 'test-variant',
            price: 10,
            action: {
              operation: 'webhook',
            },
          },
        ],
      };

      expect(() =>
        Joi.assert(product, schemas.PRODUCT_SCHEMA)
      ).toThrowErrorMatchingSnapshot();
    });

    it('should allow a product with `assets` defined', () => {
      const product = {
        slug: 'test-product',
        variants: [
          {
            slug: 'test-variant',
            price: 10,
            assets: [
              {
                path: '@truffle/test-app/_Powerup/test-powerup',
                quantity: 1,
              },
            ],
          },
        ],
      };

      Joi.assert(product, schemas.PRODUCT_SCHEMA);
    });
  });

  describe('ACTION_SCHEMA', () => {
    it('should validate sub-actions in a workflow', () => {
      const action = {
        operation: 'workflow',
        actions: [
          {
            operation: 'webhook',
            url: 'https://example.com/webhook',
          },
          {
            operation: 'webhook',
            url: 'https://example.com/webhook',
          },
        ],
      };

      const { error } = schemas.ACTION_SCHEMA.validate(action);
      expect(error).toBeUndefined();
    });

    it('should throw an error if a sub-action is invalid', () => {
      const action = {
        operation: 'workflow',
        actions: [
          {
            operation: 'webhook',
          },
          {
            operation: 'webhook',
            url: 'https://example.com/webhook',
          },
        ],
      };

      const { error } = schemas.ACTION_SCHEMA.validate(action);
      expect(error).toMatchSnapshot();
    });
  });
});
