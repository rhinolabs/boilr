/**
 * Boilr Error Handling Module
 *
 * Provides standard error classes and customizable error formatting
 * for consistent HTTP error responses across Boilr applications.
 */

// Export all error classes
export * from "./classes.js";

// Export types from types directory
export * from "../types/error.js";

// Export error handler
export { globalErrorHandler } from "./handler.js";
