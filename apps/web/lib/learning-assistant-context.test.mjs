import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LEARNING_ASSISTANT_CONTEXT_TTL_MS,
  isLearningAssistantContextCurrent,
  learningAssistantSurfaceForRoute,
  normalizeLearningAssistantRoute,
} from './learning-assistant-context.ts';

const now = Date.parse('2026-07-12T00:00:00.000Z');

test('normalizes routes without query strings or trailing slashes', () => {
  assert.equal(
    normalizeLearningAssistantRoute('/dashboard/roadmaps/abc/?tab=week'),
    '/dashboard/roadmaps/abc',
  );
});

test('maps each dashboard route to its owning assistant surface', () => {
  assert.equal(learningAssistantSurfaceForRoute('/dashboard/code-practice/problem-a'), 'code');
  assert.equal(learningAssistantSurfaceForRoute('/dashboard/roadmaps/request-a'), 'roadmap');
  assert.equal(learningAssistantSurfaceForRoute('/dashboard/cv-review'), 'cv');
});

test('accepts a fresh context only on its exact route', () => {
  const snapshot = {
    surface: 'code',
    source: 'code-editor',
    routeKey: '/dashboard/code-practice/problem-a',
    updatedAt: new Date(now).toISOString(),
  };

  assert.equal(
    isLearningAssistantContextCurrent(snapshot, '/dashboard/code-practice/problem-a', now),
    true,
  );
  assert.equal(
    isLearningAssistantContextCurrent(snapshot, '/dashboard/code-practice/problem-b', now),
    false,
  );
  assert.equal(
    isLearningAssistantContextCurrent(snapshot, '/dashboard/roadmaps/request-a', now),
    false,
  );
});

test('rejects a context whose declared surface conflicts with its route', () => {
  const snapshot = {
    surface: 'code',
    source: 'bad-publisher',
    routeKey: '/dashboard/roadmaps/request-a',
    updatedAt: new Date(now).toISOString(),
  };

  assert.equal(
    isLearningAssistantContextCurrent(snapshot, '/dashboard/roadmaps/request-a', now),
    false,
  );
});

test('rejects legacy and expired contexts', () => {
  assert.equal(
    isLearningAssistantContextCurrent(
      { surface: 'code', source: 'legacy', updatedAt: new Date(now).toISOString() },
      '/dashboard/code-practice/problem-a',
      now,
    ),
    false,
  );
  assert.equal(
    isLearningAssistantContextCurrent(
      {
        surface: 'code',
        source: 'expired',
        routeKey: '/dashboard/code-practice/problem-a',
        updatedAt: new Date(now - LEARNING_ASSISTANT_CONTEXT_TTL_MS - 1).toISOString(),
      },
      '/dashboard/code-practice/problem-a',
      now,
    ),
    false,
  );
});
