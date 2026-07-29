"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Testcase = void 0;
const mongoose_1 = require("mongoose");
const TestcaseSchema = new mongoose_1.Schema({
    problemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
    isExample: { type: Boolean, default: false },
    input: { type: String, required: true },
    output: { type: String, required: true },
});
exports.Testcase = (0, mongoose_1.model)('Testcase', TestcaseSchema);
