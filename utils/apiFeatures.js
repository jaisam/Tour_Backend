class APIFeatures {

    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        //A) Basic Filtering
        let queryObj = { ...this.queryString };
        let excludeFilelds = ['page', 'sort', 'limit', 'fields'];
        excludeFilelds.forEach(element => delete queryObj[element]);

        // B) Advanced Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            let sortBy = this.queryString.sort.split(',').join(' ');
            console.log(sortBy);
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt'); //by defualt sprting by createdAt in descending order
        }
        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fieldLimits = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fieldLimits);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        let page = this.queryString.page * 1 || 1; // By multiplying by 1, string is converted into Number.
        let limit = this.queryString.limit * 1 || 100; // By default 100 is set as limit.
        let skipBy = ( page - 1 ) * limit;

        this.query = this.query.skip(skipBy).limit(limit);
        return this;
    }
}
module.exports = APIFeatures;