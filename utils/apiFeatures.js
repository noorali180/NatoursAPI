class APIFeatures {
  /**
   *
   * @param {object} query "queryObj from mongoose"
   * @param {object} queryStr "query string from express router, which contains query params"
   */
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  // / ... / Filtering /... / //
  filter() {
    const queryObj = { ...this.queryStr };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((field) => delete queryObj[field]);

    let updatedQueryStr = JSON.stringify(queryObj);
    updatedQueryStr = JSON.parse(
      updatedQueryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
    );

    this.query.find(updatedQueryStr);

    return this;
  }

  // / ... / Sorting /... / //
  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt").sort("_id");
    }

    return this;
  }

  // / ... / FieldsLimiting /... / //
  fieldsLimiting() {
    if (this.queryStr.fields) {
      const fieldsStr = this.queryStr.fields.split(",").join(" ");

      this.query = this.query.select(fieldsStr);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  // / ... / Pagination /... / //
  pagination() {
    const page = +this.queryStr.page || 1;
    const limit = +this.queryStr.limit || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
