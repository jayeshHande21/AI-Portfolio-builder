/**
 * Zod schemas for Portfolio Blueprint runtime validation.
 */
import { z } from 'zod';

const nodeLayoutSchema = z
  .object({
    display: z.enum(['block', 'flex', 'grid']).optional(),
    direction: z.enum(['row', 'column']).optional(),
    columns: z.number().optional(),
    gap: z.string().optional(),
    alignment: z.string().optional(),
    width: z.string().optional(),
  })
  .strict();

const nodeStylesSchema = z
  .object({
    background: z.string().optional(),
    color: z.string().optional(),
    padding: z.string().optional(),
    typography: z
      .object({
        fontFamily: z.string().optional(),
        fontSize: z.string().optional(),
        fontWeight: z.union([z.string(), z.number()]).optional(),
        letterSpacing: z.string().optional(),
      })
      .optional(),
  })
  .strict();

const nodeAnimationSchema = z
  .object({
    type: z.string().optional(),
    duration: z.string().optional(),
    trigger: z.string().optional(),
  })
  .strict();

const responsiveSchema = z
  .object({
    tablet: z
      .object({
        layout: nodeLayoutSchema.optional(),
        styles: nodeStylesSchema.optional(),
      })
      .optional(),
    mobile: z
      .object({
        layout: nodeLayoutSchema.optional(),
        styles: nodeStylesSchema.optional(),
      })
      .optional(),
  })
  .strict();

export const blueprintNodeSchema: z.ZodType<{
  id: string;
  type: string;
  component?: string;
  props?: Record<string, unknown>;
  layout?: z.infer<typeof nodeLayoutSchema>;
  styles?: z.infer<typeof nodeStylesSchema>;
  animation?: z.infer<typeof nodeAnimationSchema>;
  responsive?: z.infer<typeof responsiveSchema>;
  children?: unknown[];
  metadata?: Record<string, unknown>;
}> = z.lazy(() =>
  z
    .object({
      id: z.string().min(1),
      type: z.enum([
        'section',
        'container',
        'heading',
        'text',
        'image',
        'video',
        'button',
        'component',
      ]),
      component: z.string().optional(),
      props: z.record(z.string(), z.unknown()).optional(),
      layout: nodeLayoutSchema.optional(),
      styles: nodeStylesSchema.optional(),
      animation: nodeAnimationSchema.optional(),
      responsive: responsiveSchema.optional(),
      children: z.array(blueprintNodeSchema).optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    })
    .strict(),
);

export const assetSchema = z
  .object({
    id: z.string().min(1),
    url: z.string().min(1),
    alt: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  })
  .strict();

export const portfolioBlueprintSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    themeId: z.string().optional(),
    assets: z.record(z.string(), assetSchema),
    sections: z.array(blueprintNodeSchema),
  })
  .strict();

export type PortfolioBlueprintInput = z.infer<typeof portfolioBlueprintSchema>;
