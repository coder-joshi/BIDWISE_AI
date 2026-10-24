import apiResponse from "../../common/utils/api-response.js";
import * as jobService from "./job.service.js";

/**
 * Enqueue bid for pipeline processing.
 * POST /api/v1/bids/:id/process
 */
export const processBid = async (req, res) => {
  const bidId = req.params.id;
  const userId = req.user?.id;

  const job = await jobService.enqueueBidProcessing(bidId, userId);

  return apiResponse.created(
    res,
    "Bid processing job enqueued successfully",
    {
      jobId: job._id.toString(),
      bidId: job.bid.toString(),
      status: job.status,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      createdAt: job.createdAt,
    }
  );
};

/**
 * Get job status, stages, progress, and timings for frontend polling.
 * GET /api/v1/bids/:id/status
 */
export const getBidStatus = async (req, res) => {
  const bidId = req.params.id;
  const statusData = await jobService.getBidJobStatus(bidId);

  return apiResponse.ok(res, "Bid processing status fetched successfully", statusData);
};

export default { processBid, getBidStatus };
