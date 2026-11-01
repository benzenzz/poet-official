import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolvePayosReturnUrls } from '../src/index.js';

const ALLOWED = 'https://maiphh.github.io';
const PROD_RETURN = 'https://www.poetnpo.site/ung-ho/return.html';
const PROD_CANCEL = 'https://www.poetnpo.site/ung-ho/cancel.html';

describe('resolvePayosReturnUrls', () => {
  it('missing origin -> production URLs', () => {
    const result = resolvePayosReturnUrls({
      origin: null,
      allowedOrigin: ALLOWED,
      returnUrl: 'http://evil.example/ung-ho/return.html',
      cancelUrl: 'http://evil.example/ung-ho/cancel.html',
    });
    assert.deepEqual(result, { returnUrl: PROD_RETURN, cancelUrl: PROD_CANCEL });
  });

  it('accepts maiphh.github.io with /poet/ung-ho paths', () => {
    const result = resolvePayosReturnUrls({
      origin: ALLOWED,
      allowedOrigin: ALLOWED,
      returnUrl: 'https://maiphh.github.io/poet/ung-ho/return.html',
      cancelUrl: 'https://maiphh.github.io/poet/ung-ho/cancel.html',
    });
    assert.deepEqual(result, {
      returnUrl: 'https://maiphh.github.io/poet/ung-ho/return.html',
      cancelUrl: 'https://maiphh.github.io/poet/ung-ho/cancel.html',
    });
  });

  it('accepts an origin from a comma-separated ALLOWED_ORIGIN list', () => {
    const origin = 'https://benzenzz.github.io';
    const result = resolvePayosReturnUrls({
      origin,
      allowedOrigin: 'https://maiphh.github.io,https://benzenzz.github.io',
      returnUrl: `${origin}/poet/ung-ho/return.html`,
      cancelUrl: `${origin}/poet/ung-ho/cancel.html`,
    });
    assert.deepEqual(result, {
      returnUrl: `${origin}/poet/ung-ho/return.html`,
      cancelUrl: `${origin}/poet/ung-ho/cancel.html`,
    });
  });

  it('accepts localhost:8080 with /ung-ho paths', () => {
    const origin = 'http://localhost:8080';
    const result = resolvePayosReturnUrls({
      origin,
      allowedOrigin: ALLOWED,
      returnUrl: 'http://localhost:8080/ung-ho/return.html',
      cancelUrl: 'http://localhost:8080/ung-ho/cancel.html',
    });
    assert.deepEqual(result, {
      returnUrl: 'http://localhost:8080/ung-ho/return.html',
      cancelUrl: 'http://localhost:8080/ung-ho/cancel.html',
    });
  });

  it('accepts 127.0.0.1:5500 with /ung-ho paths', () => {
    const origin = 'http://127.0.0.1:5500';
    const result = resolvePayosReturnUrls({
      origin,
      allowedOrigin: ALLOWED,
      returnUrl: 'http://127.0.0.1:5500/ung-ho/return.html',
      cancelUrl: 'http://127.0.0.1:5500/ung-ho/cancel.html',
    });
    assert.deepEqual(result, {
      returnUrl: 'http://127.0.0.1:5500/ung-ho/return.html',
      cancelUrl: 'http://127.0.0.1:5500/ung-ho/cancel.html',
    });
  });

  it('localhost origin with maiphh URLs -> null', () => {
    const result = resolvePayosReturnUrls({
      origin: 'http://localhost:8080',
      allowedOrigin: ALLOWED,
      returnUrl: PROD_RETURN,
      cancelUrl: PROD_CANCEL,
    });
    assert.equal(result, null);
  });

  it('maiphh origin with localhost URLs -> null', () => {
    const result = resolvePayosReturnUrls({
      origin: ALLOWED,
      allowedOrigin: ALLOWED,
      returnUrl: 'http://localhost:8080/ung-ho/return.html',
      cancelUrl: 'http://localhost:8080/ung-ho/cancel.html',
    });
    assert.equal(result, null);
  });

  it('wrong path -> null', () => {
    const result = resolvePayosReturnUrls({
      origin: ALLOWED,
      allowedOrigin: ALLOWED,
      returnUrl: 'https://maiphh.github.io/poet/ung-ho/thanks.html',
      cancelUrl: PROD_CANCEL,
    });
    assert.equal(result, null);
  });

  it('query string -> null', () => {
    const result = resolvePayosReturnUrls({
      origin: ALLOWED,
      allowedOrigin: ALLOWED,
      returnUrl: PROD_RETURN + '?x=1',
      cancelUrl: PROD_CANCEL,
    });
    assert.equal(result, null);
  });

  it('hash -> null', () => {
    const result = resolvePayosReturnUrls({
      origin: ALLOWED,
      allowedOrigin: ALLOWED,
      returnUrl: PROD_RETURN + '#frag',
      cancelUrl: PROD_CANCEL,
    });
    assert.equal(result, null);
  });

  it('username -> null', () => {
    const result = resolvePayosReturnUrls({
      origin: ALLOWED,
      allowedOrigin: ALLOWED,
      returnUrl: 'https://user@maiphh.github.io/poet/ung-ho/return.html',
      cancelUrl: PROD_CANCEL,
    });
    assert.equal(result, null);
  });

  it('foreign origin -> null', () => {
    const result = resolvePayosReturnUrls({
      origin: 'https://evil.example',
      allowedOrigin: ALLOWED,
      returnUrl: 'https://evil.example/ung-ho/return.html',
      cancelUrl: 'https://evil.example/ung-ho/cancel.html',
    });
    assert.equal(result, null);
  });

  it('Origin present but body URLs omitted -> null', () => {
    const result = resolvePayosReturnUrls({
      origin: ALLOWED,
      allowedOrigin: ALLOWED,
    });
    assert.equal(result, null);
  });
});
