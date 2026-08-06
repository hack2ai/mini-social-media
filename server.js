require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect Database
    await connectDB();

    // Start Server
    app.listen(PORT, () => {
      console.log("====================================");
      console.log(`🚀 Server Running`);
      console.log(`🌍 http://localhost:${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV}`);
      console.log("====================================");
    });
  } catch (error) {
    console.error("Server Startup Failed");
    console.error(error);
    process.exit(1);
  }
};

startServer();