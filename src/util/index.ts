/**
 * Helpers for various tasks
 */

import { createHmac } from 'crypto';

import config from '../config';

export function hash(str: string): string {
  return createHmac('sha256', config.hashingSecret).update(str).digest('hex');
}
