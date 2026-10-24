import apiResponse from "../../common/utils/api-response.js";
import * as tecService from "./tec.service.js";

export const generateDraft = async (req, res) => {
  const tecNote = await tecService.generateTecNoteDraft(req.params.id, req.user?.id);
  apiResponse.created(res, "TEC note draft generated successfully", tecNote);
};

export const updateNote = async (req, res) => {
  const tecNote = await tecService.updateTecNote(req.params.id, req.body, req.user);
  apiResponse.ok(res, "TEC note updated successfully", tecNote);
};

export const getNote = async (req, res) => {
  const tecNote = await tecService.getTecNoteByBidId(req.params.id);
  apiResponse.ok(res, "TEC note fetched successfully", tecNote);
};

export const exportPdf = async (req, res) => {
  await tecService.exportTecNotePdf(req.params.id, res);
};

export default {
  generateDraft,
  updateNote,
  getNote,
  exportPdf,
};
