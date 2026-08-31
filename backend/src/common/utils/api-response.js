class apiResponse {
  static ok(res, msg, data = null) {
    return res.status(200).json({
      success: true,
      msg,
      data,
    });
  }

  static created(res, msg, data = null) {
    return res.status(201).json({
      succes: true,
      msg,
      data,
    });
  }
}
export default apiResponse;
