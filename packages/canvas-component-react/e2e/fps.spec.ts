import { test, expect } from '@playwright/test';

interface FpsData {
  current: number;
  average: number;
  min: number;
  max: number;
  samples: number[];
}

interface StoryIndex {
  v: number;
  entries: Record<string, StoryEntry>;
}

interface StoryEntry {
  id: string;
  title: string;
  name: string;
  type: 'story' | 'docs';
}

const MIN_FPS_THRESHOLD = 55; // Allow some tolerance below 60
const STRESS_TEST_THRESHOLD = 40; // Lower threshold for extreme stress tests (3000+ shapes)
const SAMPLE_DURATION_MS = 3000; // Collect FPS samples for 3 seconds
const MIN_SAMPLES = 15; // Minimum samples needed for a valid test

test.describe('FPS Performance Tests', () => {
  test('all stories maintain 60fps', async ({ page, request }) => {
    // Enable console logging for debugging
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`Browser console error: ${msg.text()}`);
      }
    });

    page.on('pageerror', (err) => {
      console.log(`Page error: ${err.message}`);
    });

    // Fetch the Storybook index to get all stories
    const response = await request.get('/index.json');
    const index: StoryIndex = await response.json();

    // Filter to only story entries (not docs)
    const stories = Object.values(index.entries).filter(
      (entry) => entry.type === 'story'
    );

    console.log(`\nFound ${stories.length} stories to test\n`);

    const results: Array<{
      story: string;
      id: string;
      averageFps: number;
      minFps: number;
      maxFps: number;
      passed: boolean;
    }> = [];

    for (const story of stories) {
      const storyUrl = `/iframe.html?id=${story.id}&viewMode=story`;

      await test.step(`Testing: ${story.title} - ${story.name}`, async () => {
        console.log(`Navigating to: ${storyUrl}`);
        await page.goto(storyUrl, { waitUntil: 'domcontentloaded' });

        // Wait for the story to render
        await page.waitForTimeout(1000);

        // Check if FPS monitor exists
        const hasFpsMonitor = await page.evaluate(() => {
          return typeof (window as any).__STORYBOOK_FPS__ !== 'undefined';
        });

        console.log(`FPS monitor present: ${hasFpsMonitor}`);

        if (!hasFpsMonitor) {
          // Try waiting a bit more
          await page.waitForTimeout(2000);
          const retryCheck = await page.evaluate(() => {
            return typeof (window as any).__STORYBOOK_FPS__ !== 'undefined';
          });
          console.log(`FPS monitor after retry: ${retryCheck}`);

          if (!retryCheck) {
            results.push({
              story: `${story.title} - ${story.name}`,
              id: story.id,
              averageFps: 0,
              minFps: 0,
              maxFps: 0,
              passed: false,
            });
            console.warn(`⚠️  ${story.title} - ${story.name}: FPS monitor not found`);
            return;
          }
        }

        // Wait for samples to accumulate
        await page.waitForTimeout(SAMPLE_DURATION_MS);

        // Get the FPS data
        const fpsData = await page.evaluate((): FpsData | null => {
          return (window as any).__STORYBOOK_FPS__ || null;
        });

        if (!fpsData || fpsData.samples.length < MIN_SAMPLES) {
          console.warn(
            `⚠️  ${story.title} - ${story.name}: Not enough samples (${fpsData?.samples.length || 0})`
          );
          results.push({
            story: `${story.title} - ${story.name}`,
            id: story.id,
            averageFps: fpsData?.average || 0,
            minFps: fpsData?.min || 0,
            maxFps: fpsData?.max || 0,
            passed: false,
          });
          return;
        }

        // Use lower threshold for extreme stress tests
        const isExtremeStressTest = story.id.includes('3750');
        const threshold = isExtremeStressTest ? STRESS_TEST_THRESHOLD : MIN_FPS_THRESHOLD;
        const passed = fpsData.average >= threshold;
        results.push({
          story: `${story.title} - ${story.name}`,
          id: story.id,
          averageFps: fpsData.average,
          minFps: fpsData.min,
          maxFps: fpsData.max,
          passed,
        });

        const status = passed ? '✅' : '❌';
        console.log(
          `${status} ${story.title} - ${story.name}: avg=${fpsData.average}fps, min=${fpsData.min}fps, max=${fpsData.max}fps`
        );
      });
    }

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('FPS TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`Total stories tested: ${results.length}`);
    console.log(`Passed: ${results.filter((r) => r.passed).length}`);
    console.log(`Failed: ${results.filter((r) => !r.passed).length}`);
    console.log('');

    // Show failed stories
    const failedStories = results.filter((r) => !r.passed);
    if (failedStories.length > 0) {
      console.log('FAILED STORIES:');
      for (const result of failedStories) {
        console.log(
          `  ❌ ${result.story}: avg=${result.averageFps}fps (min=${result.minFps}, max=${result.maxFps})`
        );
      }
      console.log('');
    }

    // Assert no failures
    expect(
      failedStories.length,
      `${failedStories.length} stories failed to maintain ${MIN_FPS_THRESHOLD}fps: ${failedStories.map((s) => s.story).join(', ')}`
    ).toBe(0);
  });
});
