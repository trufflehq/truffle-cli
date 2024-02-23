import Joi from 'joi';

export const CONTENT_PAGE_TYPES = [
  'appManagement',
  'quickActions',
  'youtube',
  'youtubeVideo',
  'youtubeLive',
  'youtubeLiveUpcoming',
  'youtubeLiveNow',
  'youtubeLiveVod',
  'youtubeChatFrame',
  'twitch',
  'twitchEmbed',
] as const;
export type ContentPageType = (typeof CONTENT_PAGE_TYPES)[number];

export const OPERATION_TYPES = [
  'webhook',
  'workflow',
  'exchange',
  'conditional',
  'apply-powerup',
] as const;
export type OperationType = (typeof OPERATION_TYPES)[number];

export const EMBED_SCHEMA = Joi.object({
  slug: Joi.string().required(),
  url: Joi.string().required(),
  contentPageType: Joi.string()
    .valid(...CONTENT_PAGE_TYPES)
    .required(),
  windowProps: Joi.object({
    title: Joi.string().optional(),
    tooltipDescription: Joi.string().optional(),
    initialDimensions: Joi.object({
      width: Joi.number().required(),
      height: Joi.number().required(),
    }).optional(),
  }).optional(),
  isResizable: Joi.boolean().optional(),
  resizeBounds: Joi.object({
    minWidth: Joi.number().required(),
    minHeight: Joi.number().required(),
    maxWidth: Joi.number().required(),
    maxHeight: Joi.number().required(),
  }).optional(),
  tileProps: Joi.object({
    bgColor: Joi.string().optional(),
    title: Joi.string().optional(),
  }).optional(),
  defaultStyles: Joi.object().optional(),
  isLoginRequired: Joi.boolean().optional(),
  minTruffleVersion: Joi.string().optional(),
  maxTruffleVersion: Joi.string().optional(),
  deviceType: Joi.string().valid('desktop', 'mobile').optional(),
  status: Joi.string()
    .valid('published', 'experimental', 'disabled')
    .optional(),
});

export const ASSET_SCHEMA = Joi.object({
  path: Joi.string().required(),
  quantity: Joi.number().required(),
});

export const ACTION_SCHEMA = Joi.object({
  operation: Joi.string()
    .valid(...OPERATION_TYPES)
    .required(),
  url: Joi.when('operation', {
    is: 'webhook',
    then: Joi.string().required(),
  }),

  actions: Joi.when('operation', {
    is: 'workflow',
    then: Joi.array().items(Joi.link('#actionSchema')).required(),
  }),
}).id('actionSchema');

export const PRODUCT_VARIANT_SCHEMA = Joi.object({
  slug: Joi.string().required(),
  name: Joi.string().optional(),
  price: Joi.number().required(),
  description: Joi.string().optional(),

  action: ACTION_SCHEMA.optional(),

  assets: Joi.array().items(ASSET_SCHEMA).optional(),
});

export const PRODUCT_SCHEMA = Joi.object({
  slug: Joi.string().required(),
  name: Joi.string().optional(),
  category: Joi.string().optional(),
  rank: Joi.number().optional(),
  variants: Joi.array().items(PRODUCT_VARIANT_SCHEMA).required(),
});

export const APP_CONFIG_SCHEMA = Joi.object({
  path: Joi.string().required(),
  name: Joi.string().required(),
  cliVersion: Joi.string().required(),
  description: Joi.string().optional(),
  embeds: Joi.array().items(EMBED_SCHEMA).optional(),
  products: Joi.array().items(PRODUCT_SCHEMA).optional(),
});
