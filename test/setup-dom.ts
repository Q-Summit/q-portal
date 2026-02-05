/**
 * DOM environment setup for tests that need a browser-like DOM (e.g. unit tests).
 * This file is preloaded by Bun test to provide a DOM environment
 * for React Testing Library and other DOM-dependent testing utilities.
 */
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();
