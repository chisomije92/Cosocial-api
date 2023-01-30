"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const helmet = require("helmet");
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const users_1 = __importDefault(require("./routes/users"));
const auth_1 = __importDefault(require("./routes/auth"));
const app = (0, express_1.default)();
dotenv_1.default.config();
const { MONGO_URL } = process.env;
mongoose_1.default.set("strictQuery", true);
if (MONGO_URL) {
    mongoose_1.default.connect(MONGO_URL)
        .then(() => console.log("Connected to Mongo db"));
}
app.use(express_1.default.json());
app.use(helmet());
app.use((0, morgan_1.default)("common"));
app.use("/api/users", users_1.default);
app.use("/api/auth", auth_1.default);
app.listen(8000, () => {
    console.log("Server is running");
});
//# sourceMappingURL=index.js.map