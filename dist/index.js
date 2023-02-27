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
const posts_1 = __importDefault(require("./routes/posts"));
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
dotenv_1.default.config();
const { MONGO_URL } = process.env;
mongoose_1.default.set("strictQuery", false);
if (MONGO_URL) {
    mongoose_1.default.connect(MONGO_URL)
        .then(() => console.log("Connected to Mongo db"));
}
const fileStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(null, (0, uuid_1.v4)() + "-" + file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg") {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/images", express_1.default.static(path_1.default.join(__dirname, "images")));
app.use((0, multer_1.default)({
    storage: fileStorage,
    fileFilter: fileFilter,
}).single("image"));
app.use(helmet());
app.use((0, morgan_1.default)("common"));
app.use("/api/users", users_1.default);
app.use("/api/auth", auth_1.default);
app.use('/api/posts', posts_1.default);
app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message: message });
});
app.listen(8000, () => {
    console.log("Server is running");
});
//# sourceMappingURL=index.js.map