/**
 * ApiResponse — standardized JSON response wrapper.
 *
 * All successful responses follow this shape:
 * {
 *   success: true,
 *   statusCode: 200,
 *   message: "...",
 *   data: { ... }
 * }
 *
 * Usage:
 *   res.status(200).json(new ApiResponse(200, 'User fetched', { user }));
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Human-readable success message
   * @param {*} [data={}] - Payload to return
   */
  constructor(statusCode, message, data = {}) {
    this.statusCode = statusCode;
    this.message = message;
    this.success = statusCode < 400;
    this.data = data;
  }
}

export default ApiResponse;
